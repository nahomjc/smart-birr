import { and, eq, isNotNull } from "drizzle-orm";
import { requireDb, users, type User } from "@/lib/db";

export function getWebSignupUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ??
    "https://smart-birr-omega.vercel.app";
  return `${base}/login`;
}

export function buildTelegramSignupRequiredMessage(): string {
  const login = getWebSignupUrl();
  return `🔒 <b>Sign up to use Smart Birr</b>

The bot is only available after you create a web account and link Telegram.

1️⃣ <a href="${login}">Create your account</a>
2️⃣ Open <b>Dashboard → Settings → Telegram</b>
3️⃣ Send <code>/chatid</code> here and paste your <b>User ID</b>

Until your account is linked, the AI and budget tools stay disabled.`;
}

export function buildTelegramSignupStartMessage(): string {
  const login = getWebSignupUrl();
  return `👋 Welcome to <b>Smart Birr</b>!

This bot works with your web dashboard. Please sign up first:

1️⃣ <a href="${login}">Create your account</a>
2️⃣ Go to <b>Settings → Telegram</b> and link your ID
3️⃣ Send <code>/chatid</code> here to get your User ID

After linking, come back and tap <b>Start</b> again.`;
}

export function buildTelegramSignupHelpMessage(): string {
  const login = getWebSignupUrl();
  return `🪙 <b>Smart Birr</b> — help

<b>Before you start</b>
Sign up at <a href="${login}">smart-birr.app/login</a>, then link Telegram in Settings.

<b>After linking</b>
• 📝 Log expense — guided entry
• 📊 Budget · 📈 Report
• Natural chat — log spending or ask for advice

Need your ID? Send <code>/chatid</code>.`;
}

export async function getLinkedTelegramUser(
  telegramId: number,
): Promise<User | undefined> {
  const db = requireDb();
  return db.query.users.findFirst({
    where: and(
      eq(users.telegramId, telegramId),
      isNotNull(users.authUserId),
    ),
  });
}
