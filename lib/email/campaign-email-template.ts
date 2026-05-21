import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand";
import { getEmailAppOrigin } from "@/lib/email/app-origin";
import { escapeHtml } from "@/lib/email/escape-html";

export type CampaignEmailTemplateParams = {
  subject: string;
  message: string;
  recipientName?: string | null;
  senderName: string;
};

export function buildCampaignEmailHtml(
  params: CampaignEmailTemplateParams,
): string {
  const appOrigin = getEmailAppOrigin();
  const dashboardUrl = `${appOrigin}/dashboard`;
  const logoUrl = `${appOrigin}${BRAND_LOGO_PATH}`;
  const brandName = escapeHtml(params.senderName.trim() || "Smart Birr");
  const subject = escapeHtml(params.subject);
  const greeting = params.recipientName?.trim()
    ? `Hi ${escapeHtml(params.recipientName.trim())},`
    : "Hello,";
  const bodyHtml = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const preheader = escapeHtml(params.message.replace(/\s+/g, " ").slice(0, 120));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .email-cta { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e8eeec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#e8eeec;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-shell" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;border-collapse:collapse;">
          <!-- Header -->
          <tr>
            <td style="background-color:#060d0b;border-radius:16px 16px 0 0;padding:0;border:1px solid #134e3a;border-bottom:none;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="email-pad" style="padding:28px 32px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td valign="middle" width="56" style="padding-right:14px;">
                          <img src="${logoUrl}" alt="${escapeHtml(BRAND_LOGO_ALT)}" width="48" height="48" style="display:block;border:0;border-radius:10px;outline:none;" />
                        </td>
                        <td valign="middle">
                          <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#ecfdf5;line-height:1.2;">${brandName}</p>
                          <p style="margin:6px 0 0;font-size:13px;color:#6ee7b7;line-height:1.4;">Personal finance for Ethiopia</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;background-color:#10b981;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;border-left:1px solid #d1e7df;border-right:1px solid #d1e7df;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="email-pad" style="padding:32px 32px 8px;">
                    <p style="margin:0 0 20px;font-size:16px;font-weight:600;color:#18181b;line-height:1.5;">${greeting}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8faf9;border:1px solid #e2ebe6;border-radius:12px;">
                      <tr>
                        <td style="padding:22px 24px;">
                          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#059669;">${subject}</p>
                          <div style="font-size:15px;line-height:1.65;color:#3f3f46;">${bodyHtml}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" align="center" style="padding:8px 32px 36px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:10px;background-color:#d97706;">
                          <a href="${dashboardUrl}" class="email-cta" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;mso-padding-alt:0;">Open Smart Birr</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">View budgets, expenses, and notifications in your dashboard.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f1714;border-radius:0 0 16px 16px;border:1px solid #134e3a;border-top:none;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="email-pad" align="center" style="padding:24px 32px 28px;">
                    <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:#a1a1aa;">
                      You received this email because you have a Smart Birr account.
                    </p>
                    <p style="margin:0;font-size:12px;line-height:1.55;color:#71717a;">
                      <a href="${dashboardUrl}" style="color:#34d399;text-decoration:underline;">${escapeHtml(dashboardUrl)}</a>
                    </p>
                    <p style="margin:14px 0 0;font-size:11px;color:#52525b;line-height:1.5;">
                      &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
