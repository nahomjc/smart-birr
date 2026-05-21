import { redirect } from "next/navigation";
import { CampaignForm } from "@/components/management/campaign-form";
import { CampaignHistory } from "@/components/management/campaign-history";
import { isSessionUserAdmin } from "@/lib/auth/admin";
import {
  listCampaigns,
  listUsersForCampaignPicker,
} from "@/lib/campaigns/campaign-service";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { getBrevoConfig } from "@/lib/email/brevo";

export const dynamic = "force-dynamic";

export default async function ManagementCampaignsPage() {
  if (!(await isSessionUserAdmin())) {
    redirect("/dashboard");
  }

  let history: Awaited<ReturnType<typeof listCampaigns>> = [];
  let pickerUsers: Awaited<ReturnType<typeof listUsersForCampaignPicker>> = [];
  try {
    [history, pickerUsers] = await Promise.all([
      listCampaigns(),
      listUsersForCampaignPicker(),
    ]);
  } catch {
    /* table may not exist until migration */
  }

  const { apiKey } = getBrevoConfig();
  const emailConfigured = !!apiKey || process.env.NODE_ENV === "development";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Campaigns
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Send a message to your users as an in-app notification, by email, or
          both. Use ready-made templates or describe a campaign and let AI fill
          title and message. Emails use Brevo (same as password reset).
        </p>
      </div>

      {!emailConfigured && (
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/25 px-5 py-4 text-sm text-amber-200/90">
          Set <code className="text-amber-300">BREVO_API_KEY</code> in{" "}
          <code className="text-amber-300">.env</code> to send emails in
          production. In-app notifications work without it.
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-5">
        <section className="xl:col-span-3 rounded-xl border border-zinc-800/70 bg-[#0c1014]/90 p-6 shadow-lg shadow-black/10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            New campaign
          </h2>
          <div className="mt-5">
            <CampaignForm users={pickerUsers} templates={CAMPAIGN_TEMPLATES} />
          </div>
        </section>

        <section className="xl:col-span-2 rounded-xl border border-zinc-800/70 bg-[#0c1014]/90 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Recent campaigns
          </h2>
          <div className="mt-5">
            <CampaignHistory campaigns={history} />
          </div>
        </section>
      </div>
    </div>
  );
}
