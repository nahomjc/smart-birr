"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateUserFromAuth,
  updateUserProfile,
} from "@/lib/users/service";

export type AuthActionState = { error?: string; message?: string } | null;

function getOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const incomeRaw = String(formData.get("income") ?? "").trim();
  const income = incomeRaw ? Number(incomeRaw) : undefined;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name || undefined },
      emailRedirectTo: `${getOrigin()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) return { error: error.message };

  if (data.user) {
    const appUser = await getOrCreateUserFromAuth(data.user);
    if (name || income) {
      await updateUserProfile(appUser.id, {
        name: name || undefined,
        income,
      });
    }
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    message:
      "Check your email and click the confirmation link. You'll be signed in automatically.",
  };
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  if (data.user) {
    await getOrCreateUserFromAuth(data.user);
  }

  const next = String(formData.get("next") ?? "").trim();
  redirect(next?.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getOrigin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return redirect("/login?error=oauth");
  if (data.url) redirect(data.url);
}

export async function signInWithGitHub() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${getOrigin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return redirect("/login?error=oauth");
  if (data.url) redirect(data.url);
}
