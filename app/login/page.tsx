import { AuthPage } from "@/components/auth/auth-page";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <AuthPage error={params.error} />;
}
