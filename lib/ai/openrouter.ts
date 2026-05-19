import OpenAI from "openai";
import { FINANCIAL_COUNSELOR_SYSTEM } from "./prompts";

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

export async function financialCounselorReply(
  userMessage: string,
  contextBlock?: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const systemContent = contextBlock
    ? `${FINANCIAL_COUNSELOR_SYSTEM}\n\n--- User financial context ---\n${contextBlock}`
    : FINANCIAL_COUNSELOR_SYSTEM;

  return chatCompletion([
    { role: "system", content: systemContent },
    ...history,
    { role: "user", content: userMessage },
  ]);
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
