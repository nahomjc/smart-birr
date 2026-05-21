"use client";

import { AccountMenu } from "@/components/account/account-menu";

type Props = {
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  showManagement?: boolean;
};

/** @deprecated Use AccountMenu directly */
export function LandingUserMenu(props: Props) {
  return <AccountMenu {...props} />;
}
