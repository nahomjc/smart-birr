"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { theme } from "@/lib/theme";

type Preview = {
  totalUsers: number;
  recipientCount: number;
  withEmailCount: number;
};

type Props = {
  users: CampaignPickerUser[];
};

export function CampaignForm({ users }: Props) {
  const [state, action, pending] = useActionState<
    CampaignActionState,
    FormData
  >(runCampaign, null);

  const [audience, setAudience] = useState<CampaignAudience>("all_users");
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

  const canSubmit =
    audience !== "selected" || selectedIds.size > 0;

  return (
    <form
      key={state?.success ? `done-${Date.now()}` : "new"}
      action={action}
      className="space-y-5"
    >
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Campaign title</span>
        <input
          name="title"
          required
          minLength={2}
          maxLength={120}
          placeholder="e.g. New budget tips for May"
          className={theme.input}
        />
        <span className="mt-1 block text-xs text-zinc-600">
          Used as notification title and email subject
        </span>
      </label>

      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Message</span>
        <textarea
          name="message"
          required
          minLength={5}
          rows={5}
          placeholder="Write the message users will see…"
          className={`${theme.input} resize-y min-h-[120px]`}
        />
      </label>

      <fieldset className="space-y-3">
        <legend className={`text-sm font-medium ${theme.subtext}`}>
          Channels
        </legend>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="sendInApp"
            defaultChecked
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
          />
          In-app notification (bell icon)
        </label>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
          />
          Email (Brevo — users must have an email on file)
        </label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={`text-sm font-medium ${theme.subtext}`}>
          Audience
        </legend>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="radio"
            name="audience"
            value="all_users"
            checked={audience === "all_users"}
            onChange={() => setAudience("all_users")}
            className="h-4 w-4 border-zinc-600 bg-zinc-900 text-amber-500"
          />
          All users
        </label>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="radio"
            name="audience"
            value="with_email"
            checked={audience === "with_email"}
            onChange={() => setAudience("with_email")}
            className="h-4 w-4 border-zinc-600 bg-zinc-900 text-amber-500"
          />
          Only users with email
        </label>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="radio"
            name="audience"
            value="selected"
            checked={audience === "selected"}
            onChange={() => setAudience("selected")}
            className="h-4 w-4 border-zinc-600 bg-zinc-900 text-amber-500"
          />
          Select individual users
        </label>
      </fieldset>

      {audience === "selected" && (
        <CampaignUserPicker
          users={users}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      )}

      {preview && (
        <p className="text-xs text-zinc-500">
          Will reach{" "}
          <strong className="text-zinc-300">{preview.recipientCount}</strong>{" "}
          user{preview.recipientCount === 1 ? "" : "s"}
          {sendEmail && preview.withEmailCount < preview.recipientCount && (
            <>
              {" "}
              ({preview.withEmailCount} can receive email)
            </>
          )}
          {audience === "selected" && selectedIds.size === 0 && (
            <span className="text-amber-400/90"> — select at least one user</span>
          )}
        </p>
      )}

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

      <Button
        type="submit"
        disabled={pending || !canSubmit}
        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send campaign"}
      </Button>
    </form>
  );
}
