import { createHash, randomInt } from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { passwordResetOtps, requireDb, users } from "@/lib/db";
import { sendPasswordResetOtpEmail } from "@/lib/email/send-password-reset-otp";
import { createAdminClient } from "@/lib/supabase/admin";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashOtp(code: string): string {
  const pepper =
    process.env.PASSWORD_RESET_OTP_PEPPER?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "smart-birr-dev-pepper";
  return createHash("sha256").update(`${code}:${pepper}`).digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100_000, 1_000_000));
}

async function resolveAuthUserId(email: string): Promise<string | null> {
  const db = requireDb();
  const normalized = normalizeEmail(email);

  const appUser = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${normalized}`,
    columns: { authUserId: true },
  });
  if (appUser?.authUserId) return appUser.authUserId;

  const rows = (await db.execute(
    sql`SELECT id::text AS id FROM auth.users WHERE lower(email) = ${normalized} LIMIT 1`,
  )) as { id: string }[];
  return rows[0]?.id ?? null;
}

export async function requestPasswordResetOtp(
  rawEmail: string,
): Promise<{ ok: true; message: string }> {
  const email = normalizeEmail(rawEmail);
  if (!email || !email.includes("@")) {
    return {
      ok: true,
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  const authUserId = await resolveAuthUserId(email);
  if (!authUserId) {
    return {
      ok: true,
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  const db = requireDb();
  const now = new Date();

  const [latest] = await db
    .select({ createdAt: passwordResetOtps.createdAt })
    .from(passwordResetOtps)
    .where(
      and(
        eq(passwordResetOtps.email, email),
        isNull(passwordResetOtps.consumedAt),
        gt(passwordResetOtps.expiresAt, now),
      ),
    )
    .orderBy(desc(passwordResetOtps.createdAt))
    .limit(1);

  if (
    latest?.createdAt &&
    now.getTime() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    return {
      ok: true,
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  const otp = generateOtp();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  await db.insert(passwordResetOtps).values({
    email,
    authUserId,
    codeHash: hashOtp(otp),
    expiresAt,
  });

  await sendPasswordResetOtpEmail(email, otp);

  return {
    ok: true,
    message:
      "If an account exists for this email, a verification code has been sent.",
  };
}

export async function resetPasswordWithOtp(
  rawEmail: string,
  rawOtp: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  const otp = rawOtp.replace(/\D/g, "").trim();

  if (!email || otp.length !== 6) {
    return { ok: false, error: "Enter a valid email and 6-digit code." };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const db = requireDb();
  const now = new Date();

  const [row] = await db
    .select()
    .from(passwordResetOtps)
    .where(
      and(
        eq(passwordResetOtps.email, email),
        isNull(passwordResetOtps.consumedAt),
        gt(passwordResetOtps.expiresAt, now),
      ),
    )
    .orderBy(desc(passwordResetOtps.createdAt))
    .limit(1);

  if (!row) {
    return {
      ok: false,
      error: "Code expired or not found. Request a new code.",
    };
  }

  if (row.attempts >= row.maxAttempts) {
    return {
      ok: false,
      error: "Too many attempts. Request a new code.",
    };
  }

  const codeHash = hashOtp(otp);
  if (row.codeHash !== codeHash) {
    await db
      .update(passwordResetOtps)
      .set({ attempts: row.attempts + 1 })
      .where(eq(passwordResetOtps.id, row.id));
    return { ok: false, error: "Invalid verification code." };
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(
    row.authUserId,
    { password: newPassword },
  );

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await db
    .update(passwordResetOtps)
    .set({ consumedAt: now })
    .where(eq(passwordResetOtps.id, row.id));

  return { ok: true };
}
