import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return { url, anonKey };
}

/** Supabase client for Route Handlers — cookies must be written on `response`. */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, anonKey } = getSupabasePublicEnv();
  return createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
}

export function authRedirectUrl(request: NextRequest, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (process.env.NODE_ENV === "production" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${path}`;
  }
  return `${origin}${path}`;
}
