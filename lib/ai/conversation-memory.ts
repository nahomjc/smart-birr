import { desc, eq } from "drizzle-orm";
import { aiConversations, requireDb } from "@/lib/db";
import type { ChatMessage } from "./openrouter";

export const MEMORY_TURNS_WEB = 6;
export const MEMORY_TURNS_TELEGRAM = 2;

/** Recent counselor turns for multi-turn Telegram/web chat. */
export async function getRecentConversationMessages(
  userId: string,
  options?: { maxTurns?: number },
): Promise<ChatMessage[]> {
  const db = requireDb();
  const limit = options?.maxTurns ?? MEMORY_TURNS_WEB;
  const rows = await db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, userId),
    orderBy: [desc(aiConversations.createdAt)],
    limit,
  });

  const chronological = [...rows].reverse();
  const messages: ChatMessage[] = [];

  for (const row of chronological) {
    messages.push({ role: "user", content: row.message });
    messages.push({ role: "assistant", content: row.response });
  }

  return messages;
}
