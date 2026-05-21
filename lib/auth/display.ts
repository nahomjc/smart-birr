import type { User } from "@supabase/supabase-js";

export function authDisplayName(user: User) {
  const meta = user.user_metadata ?? {};
  return (
    (meta.full_name as string) ||
    (meta.name as string) ||
    user.email?.split("@")[0] ||
    "User"
  );
}

export function authAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url =
    (meta.avatar_url as string) || (meta.picture as string) || null;
  return url && url.length > 0 ? url : null;
}
