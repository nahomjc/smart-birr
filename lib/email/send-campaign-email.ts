import { getBrevoConfig, sendBrevoEmail } from "@/lib/email/brevo";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendCampaignEmail(
  toEmail: string,
  subject: string,
  message: string,
  recipientName?: string | null,
): Promise<void> {
  const { senderName } = getBrevoConfig();
  const greeting = recipientName?.trim()
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hi,";
  const bodyHtml = escapeHtml(message).replace(/\n/g, "<br/>");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#18181b">
      <div style="border-bottom:2px solid #059669;padding-bottom:12px;margin-bottom:20px">
        <strong style="color:#059669;font-size:18px">${escapeHtml(senderName)}</strong>
      </div>
      <p style="font-size:15px;line-height:1.5">${greeting}</p>
      <div style="font-size:15px;line-height:1.6;color:#3f3f46;margin:16px 0">${bodyHtml}</div>
      <p style="font-size:13px;color:#71717a;margin-top:28px">
        You received this because you use Smart Birr. Open the app to see this in your notifications.
      </p>
    </div>
  `;

  await sendBrevoEmail({
    toEmail,
    subject,
    htmlContent: html,
  });
}
