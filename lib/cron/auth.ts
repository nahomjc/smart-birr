export function verifyCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.warn("CRON_SECRET is not set — cron routes disabled");
    return false;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
