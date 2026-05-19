import { buildFinancialContextForUser } from "@/lib/ai/build-financial-context";
import { financialCounselorReply } from "@/lib/ai/openrouter";
import { formatEthiopiaNow } from "@/lib/datetime/ethiopia";
import { formatTelegramOutboundMessage } from "@/lib/telegram/format-message";

export async function generateMorningSpendingGuide(
  userId: string,
): Promise<string> {
  const context = await buildFinancialContextForUser(userId);
  const when = formatEthiopiaNow();

  const raw = await financialCounselorReply(
    `It is now ${when} (Ethiopia / Addis Ababa time).

Give a practical morning spending guide for TODAY in ETB:
- Suggested amounts for breakfast, lunch, coffee/snacks, and transport
- Reference their category budget limits and what is left this month
- One short savings tip

Keep it under 14 lines. Use simple labels. No markdown tables.`,
    context || undefined,
    [],
    { channel: "telegram" },
  );

  return formatTelegramOutboundMessage(raw);
}
