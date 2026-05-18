"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { processChatMessage, type ChatResult } from "@/lib/services/chat";

export async function sendChatMessage(message: string): Promise<ChatResult> {
  const userId = await requireUserId();
  const text = message.trim();
  if (!text) {
    throw new Error("Message is required");
  }
  if (text.length > 4000) {
    throw new Error("Message is too long");
  }

  const result = await processChatMessage(userId, text);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return result;
}
