const BREVO_API = "https://api.brevo.com/v3/smtp/email";

export function getBrevoConfig() {
  const apiKey =
    process.env.BREVO_API_KEY?.trim() ?? process.env.BREVO_SMTP_KEY?.trim();
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL?.trim() ?? "nahomfjh@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() ?? "Smart Birr";
  return { apiKey, senderEmail, senderName };
}

export async function sendBrevoEmail(params: {
  toEmail: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[dev] Email to ${params.toEmail} — ${params.subject}\n${params.htmlContent.replace(/<[^>]+>/g, " ").slice(0, 200)}…`,
      );
      return;
    }
    throw new Error(
      "Email is not configured. Set BREVO_API_KEY in your environment.",
    );
  }

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: params.toEmail }],
      subject: params.subject,
      htmlContent: params.htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send email (${res.status}): ${body}`);
  }
}
