import type { Metadata } from "next";
import { NotFoundPage } from "@/components/errors/not-found-page";
import { getSessionUserId } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Page not found — Smart Birr",
  description: "The page you are looking for does not exist.",
};

export default async function NotFound() {
  const userId = await getSessionUserId();
  return <NotFoundPage isSignedIn={Boolean(userId)} />;
}
