"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CampaignComposeTools } from "@/components/management/campaign-compose-tools";
import { CampaignDeliverySettings } from "@/components/management/campaign-delivery-settings";
import { CampaignUserPicker } from "@/components/management/campaign-user-picker";
import {
  loadCampaignPreview,
  runCampaign,
  type CampaignActionState,
} from "@/app/actions/campaigns";
import type {
  CampaignAudience,
  CampaignPickerUser,
} from "@/lib/campaigns/campaign-service";
import type { CampaignTemplate } from "@/lib/campaigns/templates";
import { theme } from "@/lib/theme";

type Preview = {
  totalUsers: number;
  recipientCount: number;
  withEmailCount: number;
};

type Props = {
  users: CampaignPickerUser[];
  templates: CampaignTemplate[];
};

export function CampaignForm({ users, templates }: Props) {
  const [state, action, pending] = useActionState<
    CampaignActionState,
    FormData
  >(runCampaign, null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<CampaignAudience>("all_users");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Preview | null>(null);

  const selectedIdList = useMemo(
    () => Array.from(selectedIds),
    [selectedIds],
  );

  useEffect(() => {
    let cancelled = false;
    loadCampaignPreview(
      audience,
      audience === "selected" ? selectedIdList : undefined,
    ).then((data) => {
      if (!cancelled && data) setPreview(data);
    });
    return () => {
      cancelled = true;
    };
  }, [audience, selectedIdList]);

  function applyDraft(draft: { title: string; message: string }) {
    setTitle(draft.title);
    setMessage(draft.message);
  }

  const recipientHint = preview
    ? `This send will reach ${preview.recipientCount} user${preview.recipientCount === 1 ? "" : "s"}${
        sendEmail && preview.withEmailCount < preview.recipientCount
          ? ` (${preview.withEmailCount} can receive email)`
          : ""
      }${audience === "selected" && selectedIds.size === 0 ? " — pick at least one user below" : ""}.`
    : undefined;

  const canSubmit =
    (sendInApp || sendEmail) &&
    (audience !== "selected" || selectedIds.size > 0) &&
    title.trim().length >= 2 &&
    message.trim().length >= 5;

  return (
    <div className="space-y-6">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && state.result && (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Campaign sent to {state.result.recipientCount} users.
          {state.result.inAppSent > 0 && (
            <> {state.result.inAppSent} in-app.</>
          )}
          {state.result.emailSent > 0 && (
            <> {state.result.emailSent} emails sent.</>
          )}
          {state.result.emailFailed > 0 && (
            <> {state.result.emailFailed} emails failed.</>
          )}
        </div>
      )}

      <form action={action} className="space-y-6">
      <input type="hidden" name="audience" value={audience} />
      {sendInApp ? <input type="hidden" name="sendInApp" value="on" /> : null}
      {sendEmail ? <input type="hidden" name="sendEmail" value="on" /> : null}
      <CampaignComposeTools templates={templates} onApply={applyDraft} />

      <CampaignDeliverySettings
        audience={audience}
        onAudienceChange={setAudience}
        sendInApp={sendInApp}
        onSendInAppChange={setSendInApp}
        sendEmail={sendEmail}
        onSendEmailChange={setSendEmail}
        recipientHint={recipientHint}
      />

      {audience === "selected" && (
        <CampaignUserPicker
          users={users}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      )}

      <section className="space-y-4 rounded-xl border border-zinc-800/70 bg-[#0c1014]/90 p-5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Message content
          </h3>
          <p className="mt-1 text-xs text-zinc-600">
            Title and body sent to users. Use templates or AI above, then edit
            here.
          </p>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-300">
            Campaign title
          </span>
          <input
            name="title"
            required
            minLength={2}
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Start the new year with a savings plan"
            className={theme.input}
          />
          <span className="mt-1 block text-xs text-zinc-600">
            Notification title and email subject line
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-300">
            Message
          </span>
          <textarea
            name="message"
            required
            minLength={5}
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the message users will see…"
            className={[theme.input, "resize-y min-h-[140px]"].join(" ")}
          />
        </label>
      </section>

      <Button
        type="submit"
        disabled={pending || !canSubmit}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Sending…" : "Send campaign"}
      </Button>
    </form>
    </div>
  );
}
