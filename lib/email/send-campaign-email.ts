import { buildCampaignEmailHtml } from "@/lib/email/campaign-email-template";
import { getBrevoConfig, sendBrevoEmail } from "@/lib/email/brevo";

export async function sendCampaignEmail(
  toEmail: string,
  subject: string,
  message: string,
  recipientName?: string | null,
): Promise<void> {
  const { senderName } = getBrevoConfig();

  const html = buildCampaignEmailHtml({
    subject,
    message,
    recipientName,
    senderName,
  });

  await sendBrevoEmail({
    toEmail,
    subject,
    htmlContent: html,
  });
}
