import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getOrCreateUserFromAuth } from "@/lib/users/service";
import {
  authRedirectUrl,
  createRouteHandlerClient,
} from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";

  if (code) {
    const target = authRedirectUrl(request, next);
    const response = NextResponse.redirect(target);
    const supabase = createRouteHandlerClient(request, response);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await getOrCreateUserFromAuth(data.user);
      return response;
    }
  }

  if (tokenHash && type) {
    const target = authRedirectUrl(request, next);
    const response = NextResponse.redirect(target);
    const supabase = createRouteHandlerClient(request, response);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error && data.user) {
      await getOrCreateUserFromAuth(data.user);
      return response;
    }
  }

  const detail =
    searchParams.get("error_description") ??
    searchParams.get("error") ??
    "auth_callback_failed";
  const loginPath = `/login?error=auth_callback_failed&message=${encodeURIComponent(detail)}`;
  return NextResponse.redirect(authRedirectUrl(request, loginPath));
}
