import { count, desc, eq, inArray } from "drizzle-orm";
import { requireDb, users, campaigns, type Campaign } from "@/lib/db";
import { sendCampaignEmail } from "@/lib/email/send-campaign-email";
import { createNotification } from "@/lib/notifications/create-notification";
import { syncUserEmailsFromAuth } from "@/lib/users/sync-email-from-auth";

function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim();
  return trimmed ? trimmed : null;
}

export type CampaignAudience = "all_users" | "with_email" | "selected";

export type CampaignPickerUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export type SendCampaignInput = {
  title: string;
  message: string;
  audience: CampaignAudience;
  selectedUserIds?: string[];
  sendInApp: boolean;
  sendEmail: boolean;
  createdByUserId: string;
};

export type SendCampaignResult = {
  campaignId: string;
  recipientCount: number;
  inAppSent: number;
  emailSent: number;
  emailFailed: number;
};

export async function listUsersForCampaignPicker(): Promise<
  CampaignPickerUser[]
> {
  await syncUserEmailsFromAuth();
  const db = requireDb();
  const rows = await db.query.users.findMany({
    columns: { id: true, name: true, email: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
  return rows;
}

export async function getCampaignAudiencePreview(
  audience: CampaignAudience,
  selectedUserIds?: string[],
) {
  await syncUserEmailsFromAuth();
  const db = requireDb();
  const all = await db.query.users.findMany({
    columns: { id: true, email: true },
  });
  const withEmail = all.filter((u) => normalizeEmail(u.email));

  if (audience === "selected") {
    const ids = selectedUserIds ?? [];
    const selected = all.filter((u) => ids.includes(u.id));
    const selectedWithEmail = selected.filter((u) => normalizeEmail(u.email));
    return {
      totalUsers: all.length,
      recipientCount: selected.length,
      withEmailCount: selectedWithEmail.length,
    };
  }

  if (audience === "with_email") {
    return {
      totalUsers: all.length,
      recipientCount: withEmail.length,
      withEmailCount: withEmail.length,
    };
  }

  return {
    totalUsers: all.length,
    recipientCount: all.length,
    withEmailCount: withEmail.length,
  };
}

async function resolveRecipients(
  audience: CampaignAudience,
  selectedUserIds?: string[],
) {
  const db = requireDb();

  if (audience === "selected") {
    const ids = [...new Set(selectedUserIds ?? [])].filter(Boolean);
    if (!ids.length) return [];
    return db.query.users.findMany({
      where: inArray(users.id, ids),
      columns: { id: true, email: true, name: true },
    });
  }

  if (audience === "with_email") {
    const all = await db.query.users.findMany({
      columns: { id: true, email: true, name: true },
    });
    return all.filter((u) => normalizeEmail(u.email));
  }

  return db.query.users.findMany({
    columns: { id: true, email: true, name: true },
  });
}

async function sendCampaignEmails(
  recipients: Array<{ email: string | null; name: string | null }>,
  title: string,
  message: string,
): Promise<{ sent: number; failed: number; firstError?: string }> {
  const targets = recipients
    .map((r) => ({
      email: normalizeEmail(r.email),
      name: r.name,
    }))
    .filter((r): r is { email: string; name: string | null } => !!r.email);

  let sent = 0;
  let failed = 0;
  let firstError: string | undefined;
  const concurrency = 5;

  for (let i = 0; i < targets.length; i += concurrency) {
    const chunk = targets.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      chunk.map((t) =>
        sendCampaignEmail(t.email, title, message, t.name),
      ),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent += 1;
      } else {
        failed += 1;
        if (!firstError) {
          firstError =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);
        }
      }
    }

    if (i + concurrency < targets.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return { sent, failed, firstError };
}

export async function sendCampaign(
  input: SendCampaignInput,
): Promise<SendCampaignResult> {
  if (!input.sendInApp && !input.sendEmail) {
    throw new Error("Select at least one channel: in-app or email");
  }

  await syncUserEmailsFromAuth();

  if (input.audience === "selected") {
    const count = input.selectedUserIds?.length ?? 0;
    if (count === 0) {
      throw new Error("Select at least one user");
    }
  }

  const recipients = await resolveRecipients(
    input.audience,
    input.selectedUserIds,
  );
  if (!recipients.length) {
    throw new Error("No users match this audience");
  }

  const emailTargets = recipients.filter((u) => normalizeEmail(u.email));
  if (input.sendEmail && emailTargets.length === 0) {
    throw new Error(
      "No recipients have an email on file. Users must sign in with email or be synced from auth.",
    );
  }

  let inAppSent = 0;
  let emailSent = 0;
  let emailFailed = 0;

  const db = requireDb();
  const [campaignRow] = await db
    .insert(campaigns)
    .values({
      createdByUserId: input.createdByUserId,
      title: input.title,
      message: input.message,
      audience: input.audience,
      recipientIds:
        input.audience === "selected"
          ? (input.selectedUserIds ?? [])
          : null,
      sendInApp: input.sendInApp,
      sendEmail: input.sendEmail,
      recipientCount: recipients.length,
      inAppSent: 0,
      emailSent: 0,
      emailFailed: 0,
    })
    .returning();

  for (const user of recipients) {
    if (input.sendInApp) {
      await createNotification(user.id, {
        type: "campaign",
        title: input.title,
        message: input.message,
        meta: { campaignId: campaignRow.id },
      });
      inAppSent += 1;
    }
  }

  if (input.sendEmail) {
    const emailResult = await sendCampaignEmails(
      recipients,
      input.title,
      input.message,
    );
    emailSent = emailResult.sent;
    emailFailed = emailResult.failed;

    if (emailSent === 0 && emailTargets.length > 0) {
      throw new Error(
        emailResult.firstError
          ? `Email delivery failed: ${emailResult.firstError}`
          : "Email delivery failed for all recipients. Check Brevo configuration and rate limits.",
      );
    }
  }

  await db
    .update(campaigns)
    .set({ inAppSent, emailSent, emailFailed })
    .where(eq(campaigns.id, campaignRow.id));

  return {
    campaignId: campaignRow.id,
    recipientCount: recipients.length,
    inAppSent,
    emailSent,
    emailFailed,
  };
}

export const CAMPAIGNS_PAGE_SIZE = 10;

const campaignListWith = {
  createdBy: {
    columns: { id: true, name: true, email: true },
  },
} as const;

export type CampaignListRow = Campaign & {
  createdBy: { id: string; name: string | null; email: string | null } | null;
};

export type PaginatedCampaigns = {
  items: CampaignListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listCampaignsPaginated(
  page = 1,
  pageSize = CAMPAIGNS_PAGE_SIZE,
): Promise<PaginatedCampaigns> {
  const db = requireDb();
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const requestedPage = Math.max(1, Math.floor(page));

  const [countRow] = await db
    .select({ total: count() })
    .from(campaigns);
  const total = Number(countRow?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize);
  const pageNum =
    totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (pageNum - 1) * safePageSize;

  const items = await db.query.campaigns.findMany({
    orderBy: [desc(campaigns.createdAt)],
    limit: safePageSize,
    offset,
    with: campaignListWith,
  });

  return {
    items,
    total,
    page: pageNum,
    pageSize: safePageSize,
    totalPages,
  };
}
