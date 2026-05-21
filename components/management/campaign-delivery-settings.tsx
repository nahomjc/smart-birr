"use client";

import type { CampaignAudience } from "@/lib/campaigns/campaign-service";

type AudienceOption = {
  value: CampaignAudience;
  label: string;
  description: string;
};

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: "all_users",
    label: "All users",
    description: "Everyone registered in Smart Birr",
  },
  {
    value: "with_email",
    label: "With email only",
    description: "Users who can receive email campaigns",
  },
  {
    value: "selected",
    label: "Hand-picked",
    description: "Choose specific people below",
  },
];

type Props = {
  audience: CampaignAudience;
  onAudienceChange: (a: CampaignAudience) => void;
  sendEmail: boolean;
  onSendEmailChange: (v: boolean) => void;
  sendInApp: boolean;
  onSendInAppChange: (v: boolean) => void;
  recipientHint?: string;
};

export function CampaignDeliverySettings({
  audience,
  onAudienceChange,
  sendEmail,
  onSendEmailChange,
  sendInApp,
  onSendInAppChange,
  recipientHint,
}: Props) {
  return (
    <section className="space-y-6 rounded-xl border border-zinc-800/70 bg-[#0a0e12]/80 p-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Delivery
        </h3>
        <p className="mt-1 text-xs text-zinc-600">
          Choose how the campaign is sent and who receives it.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-300">Channels</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChannelCard
            id="sendInApp"
            name="sendInApp"
            checked={sendInApp}
            onChange={onSendInAppChange}
            title="In-app notification"
            description="Shows in the bell icon and notifications page"
            icon={<BellIcon />}
          />
          <ChannelCard
            id="sendEmail"
            name="sendEmail"
            checked={sendEmail}
            onChange={onSendEmailChange}
            title="Email"
            description="Sent via Brevo when the user has an email on file"
            icon={<MailIcon />}
          />
        </div>
        {!sendInApp && !sendEmail && (
          <p className="mt-2 text-xs text-amber-400/90">
            Select at least one channel.
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-300">Audience</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {AUDIENCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`relative cursor-pointer rounded-xl border p-4 transition ${
                audience === opt.value
                  ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                  : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              <input
                type="radio"
                name="audience"
                value={opt.value}
                checked={audience === opt.value}
                onChange={() => onAudienceChange(opt.value)}
                className="sr-only"
              />
              <span
                className={`absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border ${
                  audience === opt.value
                    ? "border-amber-400 bg-amber-500"
                    : "border-zinc-600 bg-transparent"
                }`}
              >
                {audience === opt.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                )}
              </span>
              <span className="block pr-6 text-sm font-medium text-zinc-100">
                {opt.label}
              </span>
              <span className="mt-1 block text-xs leading-snug text-zinc-500">
                {opt.description}
              </span>
            </label>
          ))}
        </div>
        {recipientHint && (
          <p className="mt-3 rounded-lg bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
            {recipientHint}
          </p>
        )}
      </div>
    </section>
  );
}

function ChannelCard({
  id,
  name,
  checked,
  onChange,
  title,
  description,
  icon,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700"
      }`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-emerald-500"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <span className="text-zinc-400">{icon}</span>
          {title}
        </span>
        <span className="mt-1 block text-xs text-zinc-500">{description}</span>
      </span>
    </label>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-5M9 17v1a3 3 0 106 0v-1m-6 4h6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
