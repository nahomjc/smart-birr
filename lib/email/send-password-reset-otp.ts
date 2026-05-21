import { sendBrevoEmail } from "@/lib/email/brevo";

export async function sendPasswordResetOtpEmail(
  toEmail: string,
  otp: string,
): Promise<void> {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#0f1714">
      <h2 style="color:#059669">Reset your Smart Birr password</h2>
      <p>Use this verification code. It expires in 10 minutes.</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0">${otp}</p>
      <p style="color:#52525b;font-size:14px">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await sendBrevoEmail({
    toEmail,
    subject: `${otp} — Smart Birr password reset code`,
    htmlContent: html,
  });
}
