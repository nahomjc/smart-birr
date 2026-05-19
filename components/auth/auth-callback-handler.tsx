"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const OTP_TYPES: EmailOtpType[] = ["signup", "email", "magiclink", "invite"];

function safeNextPath(raw: string | null): string {
  if (raw?.startsWith("/")) return raw;
  return "/dashboard";
}

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

    async function finish(path: string) {
      if (!cancelled) router.replace(path);
    }

    async function fail(message: string) {
      if (cancelled) return;
      setStatus("Redirecting…");
      const q = new URLSearchParams({
        error: "auth_callback_failed",
        message,
      });
      await finish(`/login?${q.toString()}`);
    }

    async function succeed(next: string) {
      if (cancelled) return;
      setStatus("Signed in. Redirecting…");
      await finish(next);
    }

    async function run() {
      const supabase = createClient();
      const next = safeNextPath(searchParams.get("next"));

      const urlError = searchParams.get("error");
      if (urlError) {
        await fail(
          searchParams.get("error_description") ??
            urlError ??
            "Authentication failed",
        );
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          await succeed(next);
          return;
        }
      }

      const tokenHash = searchParams.get("token_hash");
      if (tokenHash) {
        const typeParam = searchParams.get("type") as EmailOtpType | null;
        const typesToTry = typeParam
          ? [typeParam, ...OTP_TYPES.filter((t) => t !== typeParam)]
          : OTP_TYPES;

        for (const type of typesToTry) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (!error) {
            await succeed(next);
            return;
          }
        }
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            await succeed(next);
            return;
          }
        }
      }

      await fail(
        "Could not verify this link. Open it in the same browser you used to sign up, or sign in with your password.",
      );
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071210] px-6">
      <p className="text-center text-sm text-white/80">{status}</p>
    </div>
  );
}
