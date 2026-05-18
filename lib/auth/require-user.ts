import { getSessionUserId } from "./session";

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Not signed in");
  }
  return userId;
}
