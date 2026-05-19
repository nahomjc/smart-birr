import { BudgetSettingsForm } from "@/components/settings/budget-settings-form";
import { TelegramSettings } from "@/components/settings/telegram-settings";
import { getTelegramProfileData } from "@/lib/data/profile";
import { getBudgetSettingsData } from "@/lib/data/settings";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let initial = {
    periodLabel: "",
    monthlyIncome: "",
    savingsGoal: "",
    emergencyFund: "",
    categoryLimits: [] as { name: string; limit: string }[],
  };
  let telegramProfile = {
    telegramId: null as string | null,
    email: null as string | null,
    name: null as string | null,
  };

  try {
    [initial, telegramProfile] = await Promise.all([
      getBudgetSettingsData(),
      getTelegramProfileData(),
    ]);
  } catch {
    /* DB unavailable */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Settings</h1>
        <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
          You choose each category limit here. The app does not decide your
          rent, food, or transport caps unless you use &quot;Suggest amounts&quot;
          as a starting point.
        </p>
      </div>
      <TelegramSettings profile={telegramProfile} />
      <BudgetSettingsForm initial={initial} />
    </div>
  );
}
