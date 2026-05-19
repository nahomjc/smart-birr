import { Suspense } from "react";
import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#071210] text-sm text-white/80">
          Confirming your email…
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
