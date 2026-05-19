import { AuthBackLink, AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
      <AuthBackLink href="/login" label="Back to sign in" />
    </AuthShell>
  );
}
