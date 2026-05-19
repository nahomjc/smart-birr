"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  clearTelegramId,
  saveTelegramId,
  type TelegramLinkState,
} from "@/app/actions/telegram";
import type { TelegramProfileData } from "@/lib/data/profile";
import { theme } from "@/lib/theme";

type Props = {
  profile: TelegramProfileData;
};

export function TelegramSettings({ profile }: Props) {
  const [saveState, saveAction, savePending] = useActionState<
    TelegramLinkState,
    FormData
  >(saveTelegramId, null);
  const [clearState, clearAction, clearPending] = useActionState(
    clearTelegramId,
    null,
  );

  const linkedId = profile.telegramId;

  return (
    <Card>
      <h2 className="mb-1 font-medium text-zinc-100">Telegram</h2>
      <p className={`mb-4 text-sm ${theme.subtext}`}>
        Link your Telegram account for bot commands, nightly summaries, and
        budget alerts. In Telegram, message the bot{" "}
        <code className="text-emerald-400/90">/chatid</code> and copy your{" "}
        <strong className="text-zinc-300">User ID</strong> here.
      </p>

      {linkedId ? (
        <div className="mb-4 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-4 py-3">
          <p className={`text-xs ${theme.subtext}`}>Linked Telegram user ID</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">{linkedId}</p>
          <p className={`mt-2 text-xs ${theme.subtext}`}>
            Nightly reminders and reports are sent to this Telegram account.
          </p>
        </div>
      ) : (
        <p className={`mb-4 text-sm ${theme.subtext}`}>
          No Telegram ID linked yet.
        </p>
      )}

      <form
        key={saveState?.success ? "saved" : "link"}
        action={saveAction}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="block min-w-[12rem] flex-1 text-sm">
          <span className={`mb-1 block ${theme.subtext}`}>Telegram user ID</span>
          <input
            name="telegramId"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 123456789"
            defaultValue={linkedId ?? ""}
            className={theme.input}
          />
        </label>
        <Button type="submit" disabled={savePending}>
          {savePending ? "Saving…" : linkedId ? "Update ID" : "Link Telegram"}
        </Button>
      </form>

      {saveState?.error && (
        <p className="mt-2 text-sm text-red-400">{saveState.error}</p>
      )}
      {saveState?.success && (
        <p className="mt-2 text-sm text-emerald-400">Telegram ID saved.</p>
      )}

      {linkedId && (
        <form action={clearAction} className="mt-4">
          <button
            type="submit"
            disabled={clearPending}
            className="text-sm text-zinc-500 hover:text-red-400"
          >
            {clearPending ? "Removing…" : "Unlink Telegram"}
          </button>
          {clearState?.error && (
            <p className="mt-1 text-sm text-red-400">{clearState.error}</p>
          )}
        </form>
      )}
    </Card>
  );
}
