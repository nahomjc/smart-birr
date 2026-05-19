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

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: resolveModel(options?.model),
    max_tokens: options?.maxTokens ?? 800,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
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
  options?: { channel?: "web" | "telegram" },
): Promise<string> {
  return chatCompletion(
    buildCounselorMessages(userMessage, contextBlock, history, options),
  );
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
    max_tokens: 800,
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
