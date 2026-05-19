import OpenAI from "openai";
import {
  FINANCIAL_COUNSELOR_SYSTEM,
  TELEGRAM_REPLY_FORMAT,
} from "./prompts";

const FALLBACK_MODEL = "deepseek/deepseek-chat";

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

/** OpenRouter 402: requested max_tokens exceeds remaining credit budget. */
export function isOpenRouterCreditsError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 402;
  }
  return extractErrorMessage(error).includes("requires more credits");
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

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  const client = getClient();
  const model = resolveModel(options?.model);
  const initialMax = options?.maxTokens ?? DEFAULT_MAX_TOKENS_WEB;

  const run = (maxTokens: number) =>
    client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

  try {
    const completion = await run(initialMax);
    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (error) {
    const retryMax = retryMaxTokens(error, initialMax);
    if (retryMax === null) throw error;
    const completion = await run(retryMax);
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }
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
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

export async function jsonCompletion<T>(
  systemPrompt: string,
  userMessage: string,
  options?: { model?: string },
): Promise<T | null> {
  const raw = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    {
      model: resolveModel(options?.model ?? "google/gemini-2.0-flash-001"),
      maxTokens: 256,
    },
  );
  try {
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
