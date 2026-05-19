"use server";

import { redirect } from "next/navigation";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/lib/auth/password-reset-otp";
import type { AuthActionState } from "@/app/actions/auth";

export async function sendPasswordResetCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Email is required" };
  }

  try {
    await requestPasswordResetOtp(email);
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Could not send verification code. Try again later.",
    };
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}&sent=1`);
}

export async function confirmPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !otp) {
    return { error: "Email and verification code are required" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const result = await resetPasswordWithOtp(email, otp, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/login?message=Password+updated.+Sign+in+with+your+new+password.");
}

export async function resendPasswordResetCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const result = await requestPasswordResetOtp(email);
    return { message: result.message };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Could not resend code. Try again later.",
    };
  }
}
