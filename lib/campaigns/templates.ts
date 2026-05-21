export type CampaignTemplate = {
  id: string;
  label: string;
  description: string;
  title: string;
  message: string;
};

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "new-year-savings",
    label: "New Year savings",
    description: "Encourage a fresh savings habit for the new year",
    title: "Start the new year with a savings plan",
    message:
      "Happy New Year from Smart Birr! Set a small weekly savings target in Planning, log your income for January, and track progress in the app. A clear goal makes it easier to build the habit — we are here to help you stay on track.",
  },
  {
    id: "monthly-budget",
    label: "Monthly budget check-in",
    description: "Remind users to review their budget for the month",
    title: "Review your budget for this month",
    message:
      "A new month is a good time to refresh your plan. Open Smart Birr, confirm your income and category limits under Budget, and log any recurring bills like rent or transport. Staying updated helps you avoid surprises later.",
  },
  {
    id: "end-of-month",
    label: "End of month summary",
    description: "Prompt users to review spending before month ends",
    title: "Your month in review — check your spending",
    message:
      "The month is wrapping up. Take five minutes in Smart Birr to see where your ETB went, compare totals to your budget, and download your summary if you use monthly export. Small reviews lead to better decisions next month.",
  },
  {
    id: "log-expenses",
    label: "Log expenses reminder",
    description: "Nudge users who may have forgotten to track spending",
    title: "Keep your tracker up to date",
    message:
      "Accurate budgets start with honest logging. If you spent ETB this week and have not added it yet, log expenses in Smart Birr or tell the AI counselor (e.g. spent 200 birr on lunch). Your dashboard stays useful when data is current.",
  },
  {
    id: "planning-goals",
    label: "Planning goals",
    description: "Promote saving toward a specific purchase or goal",
    title: "Turn a wish into a planning goal",
    message:
      "Saving for something specific — a phone, trip, or course? Create a Planning goal in Smart Birr with a target amount and date. Add contributions when you can and watch your progress bar grow. Goals work best when they are realistic and visible.",
  },
  {
    id: "telegram-link",
    label: "Link Telegram bot",
    description: "Invite users to connect Telegram for quick logging",
    title: "Log expenses faster on Telegram",
    message:
      "You can link Smart Birr to our Telegram bot and log spending in one message (e.g. spent 350 birr on lunch). Open Settings, connect your Telegram ID, and try it — handy when you are away from the website.",
  },
  {
    id: "recurring-bills",
    label: "Set up recurring bills",
    description: "Help users add rent, subscriptions, and repeating costs",
    title: "Add your recurring bills once",
    message:
      "Rent, internet, and subscriptions repeat every month. Add them under Recurring bills in Smart Birr so due dates show on your calendar and eligible items log automatically. Less manual work, fewer missed entries.",
  },
  {
    id: "budget-alert",
    label: "Budget discipline",
    description: "Gentle reminder to stay within category limits",
    title: "Stay mindful of your category limits",
    message:
      "Your Smart Birr budget splits ETB across food, transport, rent, and more. Check Overview and Calendar this week — if a category is nearly full, small adjustments now can prevent overspending before month end.",
  },
  {
    id: "welcome",
    label: "Welcome new users",
    description: "Onboarding tone for recent sign-ups",
    title: "Welcome to Smart Birr",
    message:
      "Thanks for joining Smart Birr. Set your monthly income and budget limits, log a few recent expenses, and explore Planning if you are saving toward something. Open the AI counselor anytime you want help in plain language — we are glad you are here.",
  },
];

export function getCampaignTemplate(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id);
}
