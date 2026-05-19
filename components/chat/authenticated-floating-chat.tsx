import { getSupabaseUser } from "@/lib/auth/session";
import { FloatingAiChat } from "@/components/chat/floating-ai-chat";

/** Floating AI chat for pages outside the dashboard shell (e.g. landing). */
export async function AuthenticatedFloatingChat() {
  const authUser = await getSupabaseUser();
  if (!authUser) return null;
  return <FloatingAiChat />;
}
