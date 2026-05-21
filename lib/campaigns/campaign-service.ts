import { desc, eq, inArray, isNotNull } from "drizzle-orm";
import { requireDb, users, campaigns } from "@/lib/db";
import { sendCampaignEmail } from "@/lib/email/send-campaign-email";
import { createNotification } from "@/lib/notifications/create-notification";

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
  const db = requireDb();
  const all = await db.query.users.findMany({
    columns: { id: true, email: true },
  });
  const withEmail = all.filter((u) => u.email?.trim());

  if (audience === "selected") {
    const ids = selectedUserIds ?? [];
    const selected = all.filter((u) => ids.includes(u.id));
    const selectedWithEmail = selected.filter((u) => u.email?.trim());
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
    return db.query.users.findMany({
      where: isNotNull(users.email),
      columns: { id: true, email: true, name: true },
    });
  }

  return db.query.users.findMany({
    columns: { id: true, email: true, name: true },
  });
}

export async function sendCampaign(
  input: SendCampaignInput,
): Promise<SendCampaignResult> {
  if (!input.sendInApp && !input.sendEmail) {
    throw new Error("Select at least one channel: in-app or email");
  }

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

    if (input.sendEmail) {
      const email = user.email?.trim();
      if (!email) continue;
      try {
        await sendCampaignEmail(
          email,
          input.title,
          input.message,
          user.name,
        );
        emailSent += 1;
      } catch {
        emailFailed += 1;
      }
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

export async function listCampaigns(limit = 20) {
  const db = requireDb();
  return db.query.campaigns.findMany({
    orderBy: [desc(campaigns.createdAt)],
    limit,
    with: {
      createdBy: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
}
