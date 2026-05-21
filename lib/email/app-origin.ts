/** Base URL for links and assets in outbound email. */
export function getEmailAppOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}
