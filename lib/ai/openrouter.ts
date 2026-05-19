import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
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

/** OpenRouter 402: requested max_tokens exceeds remaining credit budget. */
export function isOpenRouterCreditsError(error: unknown): boolean {
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

function extractMessageContent(completion: ChatCompletion): string {
  const content = completion.choices?.[0]?.message?.content?.trim();
  if (content) return content;

  const finish = completion.choices?.[0]?.finish_reason;
  throw new Error(
    `OpenRouter returned no message content${finish ? ` (finish_reason: ${finish})` : ""}`,
  );
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
  const channel = options?.channel;
  return chatCompletion(buildCounselorMessages(userMessage, contextBlock, history, options), {
    maxTokens: options?.maxTokens ?? maxTokensForChannel(channel),
  });
}

/** Streams counselor tokens for web chat (OpenRouter SSE). */
export async function* streamFinancialCounselorReply(
  userMessage: string,
  contextBlock?: string,
  history: ChatMessage[] = [],
): AsyncGenerator<string> {
  const client = getClient();
  const stream = await client.chat.completions.create({
    model: resolveModel(),
    max_tokens: maxTokensForChannel("web"),
    stream: true,
    messages: buildCounselorMessages(userMessage, contextBlock, history, {
      channel: "web",
    }).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content;
    if (text) yield text;
  }
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
