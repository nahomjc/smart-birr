"use server";

import { revalidatePath } from "next/cache";
import { isSessionUserAdmin } from "@/lib/auth/admin";
import { requireUserId } from "@/lib/auth/require-user";
import {
  getCampaignAudiencePreview,
  sendCampaign,
  type CampaignAudience,
} from "@/lib/campaigns/campaign-service";
import { generateCampaignFromPrompt } from "@/lib/campaigns/generate-campaign";

export type CampaignActionState = {
  error?: string;
  success?: boolean;
  result?: {
    recipientCount: number;
    inAppSent: number;
    emailSent: number;
    emailFailed: number;
  };
} | null;

function parseAudience(value: string): CampaignAudience | null {
  if (
    value === "all_users" ||
    value === "with_email" ||
    value === "selected"
  ) {
    return value;
  }
  return null;
}

function parseSelectedUserIds(formData: FormData): string[] {
  return [
    ...new Set(
      formData
        .getAll("userIds")
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  ];
}

export async function runCampaign(
  _prev: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  if (!(await isSessionUserAdmin())) {
    return { error: "Admin access required" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const audienceValues = formData
    .getAll("audience")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const audience = parseAudience(
    audienceValues[audienceValues.length - 1] ?? "",
  );
  const sendInApp = formData.get("sendInApp") === "on";
  const sendEmail = formData.get("sendEmail") === "on";
  const selectedUserIds = parseSelectedUserIds(formData);

  if (!title || title.length < 2) {
    return { error: "Enter a title (at least 2 characters)" };
  }
  if (!message || message.length < 5) {
    return { error: "Enter a message (at least 5 characters)" };
  }
  if (!audience) {
    return { error: "Choose an audience" };
  }
  if (!sendInApp && !sendEmail) {
    return { error: "Select in-app notification and/or email" };
  }
  if (audience === "selected" && selectedUserIds.length === 0) {
    return { error: "Select at least one user" };
  }

  try {
    const adminId = await requireUserId();
    const result = await sendCampaign({
      title,
      message,
      audience,
      selectedUserIds:
        audience === "selected" ? selectedUserIds : undefined,
      sendInApp,
      sendEmail,
      createdByUserId: adminId,
    });

    revalidatePath("/managment/campaigns");

    return {
      success: true,
      result: {
        recipientCount: result.recipientCount,
        inAppSent: result.inAppSent,
        emailSent: result.emailSent,
        emailFailed: result.emailFailed,
      },
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Campaign failed",
    };
  }
}

export async function loadCampaignPreview(
  audience: CampaignAudience,
  selectedUserIds?: string[],
) {
  if (!(await isSessionUserAdmin())) {
    return null;
  }
  return getCampaignAudiencePreview(audience, selectedUserIds);
}

export type GenerateCampaignDraftResult =
  | { ok: true; title: string; message: string }
  | { ok: false; error: string };

export async function generateCampaignDraft(
  prompt: string,
): Promise<GenerateCampaignDraftResult> {
  if (!(await isSessionUserAdmin())) {
    return { ok: false, error: "Admin access required" };
  }

  const result = await generateCampaignFromPrompt(prompt);
  if ("error" in result) {
    return { ok: false, error: result.error };
  }
  return { ok: true, title: result.title, message: result.message };
}
