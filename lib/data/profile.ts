import { requireUserId } from "@/lib/auth/require-user";
import { getUserById } from "@/lib/users/service";

export type TelegramProfileData = {
  telegramId: string | null;
  email: string | null;
  name: string | null;
};

export async function getTelegramProfileData(
  userId?: string,
): Promise<TelegramProfileData> {
  const id = userId ?? (await requireUserId());
  const user = await getUserById(id);

  return {
    telegramId: user?.telegramId != null ? String(user.telegramId) : null,
    email: user?.email ?? null,
    name: user?.name ?? null,
  };
}
