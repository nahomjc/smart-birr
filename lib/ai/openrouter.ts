import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
import {
  COUNSELOR_PROMPT_TIERS,
  truncateContext,
  trimHistory,
} from "./prompt-budget";
import {
  FINANCIAL_COUNSELOR_SYSTEM,
  TELEGRAM_REPLY_FORMAT,
} from "./prompts";

const FALLBACK_MODEL = "deepseek/deepseek-chat";
/** Avoid shared Gemini free-tier rate limits; override with OPENROUTER_EXTRACTION_MODEL. */
const EXTRACTION_MODEL =
  process.env.OPENROUTER_EXTRACTION_MODEL?.trim() || FALLBACK_MODEL;

function resolveModel(override?: string): string {
  const raw = override ?? process.env.OPENROUTER_MODEL;
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : FALLBACK_MODEL;
}

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "https://smart-birr.vercel.app",
      "X-Title": "Smart Birr",
    },
  });
}

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const DEFAULT_MAX_TOKENS_WEB = 800;
/** Telegram replies are short; lower cap avoids OpenRouter 402 when credits are tight. */
const DEFAULT_MAX_TOKENS_TELEGRAM = 480;

function maxTokensForChannel(channel?: "web" | "telegram"): number {
  if (channel === "telegram") {
    const raw = process.env.OPENROUTER_MAX_TOKENS_TELEGRAM?.trim();
    const n = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOKENS_TELEGRAM;
  }
  const raw = process.env.OPENROUTER_MAX_TOKENS?.trim();
  const n = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOKENS_WEB;
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function getHttpStatus(error: unknown): number | null {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: unknown }).status;
    return typeof status === "number" ? status : null;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** OpenRouter 402: input context too large for account prompt token cap. */
export function isOpenRouterPromptTooLargeError(error: unknown): boolean {
  return extractErrorMessage(error)
    .toLowerCase()
    .includes("prompt tokens limit exceeded");
}

/** OpenRouter 402: billing / output token budget (not fixable by trimming input). */
export function isOpenRouterCreditsError(error: unknown): boolean {
  if (isOpenRouterPromptTooLargeError(error)) return false;
  if (getHttpStatus(error) === 402) return true;
  return extractErrorMessage(error).includes("requires more credits");
}

/** OpenRouter 429: upstream provider rate limit (common on shared Gemini). */
export function isOpenRouterRateLimitError(error: unknown): boolean {
  if (getHttpStatus(error) === 429) return true;
  const msg = extractErrorMessage(error).toLowerCase();
  return msg.includes("rate-limited") || msg.includes("rate limit");
}

function parseAffordableMaxTokens(message: string): number | null {
  const match = message.match(/can only afford (\d+)/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function retryMaxTokens(error: unknown, requested: number): number | null {
  if (!isOpenRouterCreditsError(error)) return null;
  const affordable = parseAffordableMaxTokens(extractErrorMessage(error));
  if (affordable !== null) {
    return Math.max(64, affordable - 32);
  }
  const halved = Math.floor(requested * 0.5);
  return halved >= 64 && halved < requested ? halved : null;
}

function contentToString(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part: unknown) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "type" in part) {
        const block = part as { type?: string; text?: string };
        if (block.type === "text" && block.text) return String(block.text);
      }
      return "";
    })
    .join("")
    .trim();
}

function extractMessageContent(completion: ChatCompletion): string {
  const choice = completion.choices?.[0];
  const content = contentToString(choice?.message?.content);
  if (content) return content;

  const refusal = choice?.message?.refusal?.trim();
  if (refusal) return refusal;

  const finish = choice?.finish_reason;
  throw new Error(
    `OpenRouter returned no message content${finish ? ` (finish_reason: ${finish})` : ""}`,
  );
}

/** Maps OpenRouter / upstream errors to short user-facing chat text. */
export function userFacingOpenRouterError(error: unknown): string {
  const status = getHttpStatus(error);
  const msg = extractErrorMessage(error);

  if (status === 401 || msg.toLowerCase().includes("invalid api key")) {
    return "AI is not configured (invalid OpenRouter API key). Ask the site admin to check OPENROUTER_API_KEY.";
  }
  if (status === 402 || isOpenRouterCreditsError(error)) {
    return "AI is temporarily unavailable (OpenRouter credits). Add credits at openrouter.ai/settings/credits, or try again later.";
  }
  if (isOpenRouterPromptTooLargeError(error)) {
    return "AI context is too large for your OpenRouter plan. Try a shorter message or add credits to raise the limit.";
  }
  if (status === 403 || msg.toLowerCase().includes("provider returned")) {
    return "The AI provider rejected this request. Wait a moment and try again, or set OPENROUTER_MODEL=deepseek/deepseek-chat on the server.";
  }
  if (status === 429 || isOpenRouterRateLimitError(error)) {
    return "The AI provider is rate-limited. Wait a minute and try again.";
  }
  if (msg.includes("OPENROUTER_API_KEY is not configured")) {
    return "AI is not configured on the server (missing OPENROUTER_API_KEY).";
  }
  if (msg.includes("no message content")) {
    return "The AI returned an empty reply. Please try again.";
  }

  return msg || "AI is temporarily unavailable. Please try again.";
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  const client = getClient();
  const primaryModel = resolveModel(options?.model);
  const models =
    primaryModel === FALLBACK_MODEL
      ? [primaryModel]
      : [primaryModel, FALLBACK_MODEL];

  let lastError: unknown;
  const initialMax = options?.maxTokens ?? DEFAULT_MAX_TOKENS_WEB;

  for (const model of models) {
    let maxTokens = initialMax;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model,
          max_tokens: maxTokens,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });
        return extractMessageContent(completion);
      } catch (error) {
        lastError = error;

        const lowerMax = retryMaxTokens(error, maxTokens);
        if (lowerMax !== null) {
          maxTokens = lowerMax;
          continue;
        }

        if (isOpenRouterRateLimitError(error) && attempt < 2) {
          await sleep(600 * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  throw lastError;
}

function buildCounselorMessages(
  userMessage: string,
  contextBlock?: string,
  history: ChatMessage[] = [],
  options?: { channel?: "web" | "telegram" },
): ChatMessage[] {
  let system = FINANCIAL_COUNSELOR_SYSTEM;
  if (options?.channel === "telegram") {
    system += `\n\n${TELEGRAM_REPLY_FORMAT}`;
  }
  const systemContent = contextBlock
    ? `${system}\n\n--- User financial context ---\n${contextBlock}`
    : system;

  return [
    { role: "system", content: systemContent },
    ...history,
    { role: "user", content: userMessage },
  ];
}

export async function financialCounselorReply(
  userMessage: string,
  contextBlock?: string,
  history: ChatMessage[] = [],
  options?: { channel?: "web" | "telegram"; maxTokens?: number },
): Promise<string> {
  const channel = options?.channel ?? "web";
  const tiers = COUNSELOR_PROMPT_TIERS[channel];
  const maxTokens = options?.maxTokens ?? maxTokensForChannel(channel);

  let lastError: unknown;

  for (const tier of tiers) {
    const messages = buildCounselorMessages(
      userMessage,
      truncateContext(contextBlock, tier.contextMaxChars),
      trimHistory(history, tier.historyTurns, tier.maxCharsPerHistoryMessage),
      options,
    );
    try {
      return await chatCompletion(messages, { maxTokens });
    } catch (error) {
      lastError = error;
      if (!isOpenRouterPromptTooLargeError(error)) throw error;
    }
  }

  throw lastError;
}

async function* streamChatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number },
): AsyncGenerator<string> {
  const client = getClient();
  const primaryModel = resolveModel();
  const models =
    primaryModel === FALLBACK_MODEL
      ? [primaryModel]
      : [primaryModel, FALLBACK_MODEL];
  const initialMax = options?.maxTokens ?? maxTokensForChannel("web");

  let lastError: unknown;

  for (const model of models) {
    let maxTokens = initialMax;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const stream = await client.chat.completions.create({
          model,
          max_tokens: maxTokens,
          stream: true,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) yield text;
        }
        return;
      } catch (error) {
        lastError = error;

        const lowerMax = retryMaxTokens(error, maxTokens);
        if (lowerMax !== null) {
          maxTokens = lowerMax;
          continue;
        }

        if (isOpenRouterRateLimitError(error) && attempt < 2) {
          await sleep(600 * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  throw lastError;
}

/** Streams counselor tokens for web chat (OpenRouter SSE). */
export async function* streamFinancialCounselorReply(
  userMessage: string,
  contextBlock?: string,
  history: ChatMessage[] = [],
): AsyncGenerator<string> {
  const tiers = COUNSELOR_PROMPT_TIERS.web;
  const maxTokens = maxTokensForChannel("web");
  let lastError: unknown;

  for (const tier of tiers) {
    const messages = buildCounselorMessages(
      userMessage,
      truncateContext(contextBlock, tier.contextMaxChars),
      trimHistory(history, tier.historyTurns, tier.maxCharsPerHistoryMessage),
      { channel: "web" },
    );

    try {
      let yielded = false;
      for await (const chunk of streamChatCompletion(messages, { maxTokens })) {
        yielded = true;
        yield chunk;
      }
      if (yielded) return;

      const full = await chatCompletion(messages, { maxTokens });
      if (full.trim()) {
        yield full;
        return;
      }
    } catch (error) {
      lastError = error;
      if (!isOpenRouterPromptTooLargeError(error)) throw error;
    }
  }

  throw lastError;
}

export async function jsonCompletion<T>(
  systemPrompt: string,
  userMessage: string,
  options?: { model?: string },
): Promise<T | null> {
  try {
    const raw = await chatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      {
        model: options?.model ?? EXTRACTION_MODEL,
        maxTokens: 256,
      },
    );
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("jsonCompletion failed:", error);
    return null;
  }
}
