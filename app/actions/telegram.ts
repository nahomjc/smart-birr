"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { linkTelegramId, unlinkTelegramId } from "@/lib/users/service";

export type TelegramLinkState = { error?: string; success?: boolean } | null;

export async function saveTelegramId(
  _prev: TelegramLinkState,
  formData: FormData,
): Promise<TelegramLinkState> {
  const raw = String(formData.get("telegramId") ?? "").trim();
  if (!raw) {
    return { error: "Telegram user ID is required" };
  }

  const telegramId = Number(raw.replace(/\s/g, ""));
  if (!Number.isInteger(telegramId) || telegramId <= 0) {
    return { error: "Enter a valid numeric ID from the bot’s /chatid command" };
  }

  try {
    const userId = await requireUserId();
    await linkTelegramId(userId, telegramId);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to link Telegram",
    };
  }
}

export async function clearTelegramId(
  _prev: TelegramLinkState,
): Promise<TelegramLinkState> {
  try {
    const userId = await requireUserId();
    await unlinkTelegramId(userId);
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to unlink Telegram",
    };
  }
}
