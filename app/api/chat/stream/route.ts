import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { streamFinancialCounselorReply } from "@/lib/ai/openrouter";
import {
  prepareFinancialMessage,
  webExpenseLoggedSuffix,
} from "@/lib/services/financial-message";
import { saveConversation } from "@/lib/users/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response("Not signed in", { status: 401 });
    }

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim() ?? "";
    if (!message) {
      return new Response("Message is required", { status: 400 });
    }
    if (message.length > 4000) {
      return new Response("Message is too long", { status: 400 });
    }

    const prep = await prepareFinancialMessage(userId, message, {
      channel: "web",
    });

    const expensePayload = prep.expenseLogged
      ? {
          amount: prep.expenseLogged.amount,
          category: prep.expenseLogged.category,
        }
      : null;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ expenseLogged: expensePayload })}\n`,
            ),
          );

          let fullReply = "";
          for await (const chunk of streamFinancialCounselorReply(
            prep.userPrompt,
            prep.context || undefined,
            prep.history,
          )) {
            fullReply += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          const suffix = webExpenseLoggedSuffix(prep.expenseLogged);
          if (suffix) {
            fullReply += suffix;
            controller.enqueue(encoder.encode(suffix));
          }

          await saveConversation(userId, message, fullReply);
          revalidatePath("/dashboard");
          revalidatePath("/dashboard/expenses");
          revalidatePath("/dashboard/planning");
          revalidatePath("/dashboard/budget");
          controller.close();
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Chat stream failed";
          controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Chat failed";
    return new Response(msg, { status: 500 });
  }
}
