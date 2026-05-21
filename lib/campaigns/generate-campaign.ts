import { z } from "zod";
import { jsonCompletion } from "@/lib/ai/openrouter";

const CAMPAIGN_GENERATION_SYSTEM = `You write notification and email campaigns for Smart Birr, a personal finance app used in Ethiopia (currency: ETB / Birr).

The admin will describe what they want in plain language. You produce:
- title: short subject line (max 100 characters), clear and professional
- message: 2–5 sentences, warm and actionable, suitable for in-app notification and email body

Rules:
- Match the admin's intent (events, savings, reminders, product tips, holidays, etc.)
- Mention ETB or Birr when talking about money
- No markdown, no bullet lists, no JSON in the message
- Do not invent features that do not exist: budgeting, expenses, recurring bills, calendar, planning goals, AI counselor, Telegram bot, monthly export
- Return ONLY valid JSON: {"title":"...","message":"..."}`;

const draftSchema = z.object({
  title: z.string().min(2).max(120),
  message: z.string().min(10).max(2000),
});

export async function generateCampaignFromPrompt(
  adminPrompt: string,
): Promise<{ title: string; message: string } | { error: string }> {
  const prompt = adminPrompt.trim();
  if (prompt.length < 3) {
    return { error: "Describe what campaign you want (at least a few words)." };
  }
  if (prompt.length > 500) {
    return { error: "Prompt is too long (max 500 characters)." };
  }

  const parsed = await jsonCompletion<{ title?: string; message?: string }>(
    CAMPAIGN_GENERATION_SYSTEM,
    prompt,
    { maxTokens: 600 },
  );

  if (!parsed?.title?.trim() || !parsed?.message?.trim()) {
    return {
      error:
        "AI could not generate a campaign. Check OPENROUTER_API_KEY or try rephrasing.",
    };
  }

  const validated = draftSchema.safeParse({
    title: parsed.title.trim(),
    message: parsed.message.trim(),
  });

  if (!validated.success) {
    return { error: "Generated text was invalid. Try again with a clearer prompt." };
  }

  return validated.data;
}
