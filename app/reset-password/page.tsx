import { redirect } from "next/navigation";
import { AuthBackLink, AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <AuthShell>
      <ResetPasswordForm email={email} justSent={params.sent === "1"} />
      <AuthBackLink href="/forgot-password" label="Use a different email" />
    </AuthShell>
  );
}
