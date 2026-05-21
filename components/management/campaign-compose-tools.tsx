"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateCampaignDraft } from "@/app/actions/campaigns";
import type { CampaignTemplate } from "@/lib/campaigns/templates";
import { theme } from "@/lib/theme";

type Props = {
  templates: CampaignTemplate[];
  onApply: (draft: { title: string; message: string }) => void;
};

export function CampaignComposeTools({ templates, onApply }: Props) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyTemplate(t: CampaignTemplate) {
    setActiveTemplateId(t.id);
    setAiError(null);
    onApply({ title: t.title, message: t.message });
  }

  function handleGenerate() {
    setAiError(null);
    startTransition(async () => {
      const result = await generateCampaignDraft(aiPrompt);
      if (!result.ok) {
        setAiError(result.error);
        return;
      }
      setActiveTemplateId(null);
      onApply({ title: result.title, message: result.message });
    });
  }

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800/80 bg-zinc-950/30 p-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Templates
        </h3>
        <p className="mt-1 text-xs text-zinc-600">
          Fills the message section below — adjust delivery and audience first.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`rounded-lg border px-3 py-2.5 text-left transition ${
                activeTemplateId === t.id
                  ? "border-amber-500/40 bg-amber-500/10 ring-1 ring-amber-500/25"
                  : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
              }`}
            >
              <span className="block text-sm font-medium text-zinc-200">
                {t.label}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 line-clamp-2">
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800/60 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          AI draft
        </h3>
        <p className="mt-1 text-xs text-zinc-600">
          Describe the campaign in your own words — e.g. &quot;prepare a campaign
          to save for new year&quot;.
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Encourage users to set a New Year savings goal and log January income…"
          className={`${theme.input} mt-3 resize-y min-h-[80px]`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending || aiPrompt.trim().length < 3}
            onClick={handleGenerate}
          >
            {isPending ? "Generating…" : "Generate with AI"}
          </Button>
          <span className="text-xs text-zinc-600">
            {aiPrompt.length}/500
          </span>
        </div>
        {aiError && (
          <p className="mt-2 text-sm text-red-400">{aiError}</p>
        )}
      </div>
    </div>
  );
}
