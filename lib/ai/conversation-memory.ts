import { desc, eq } from "drizzle-orm";
import { aiConversations, requireDb } from "@/lib/db";
import type { ChatMessage } from "./openrouter";

const MEMORY_TURNS = 6;

/** Recent counselor turns for multi-turn Telegram/web chat. */
export async function getRecentConversationMessages(
  userId: string,
): Promise<ChatMessage[]> {
  const db = requireDb();
  const rows = await db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, userId),
    orderBy: [desc(aiConversations.createdAt)],
    limit: MEMORY_TURNS,
  });

  const chronological = [...rows].reverse();
  const messages: ChatMessage[] = [];

  for (const row of chronological) {
    messages.push({ role: "user", content: row.message });
    messages.push({ role: "assistant", content: row.response });
  }

  return messages;
}
