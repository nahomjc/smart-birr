"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  updateUserRole,
  type UpdateRoleState,
} from "@/app/actions/admin-users";
import type { AppRole } from "@/lib/auth/roles";
import { theme } from "@/lib/theme";

export function UserRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: AppRole;
}) {
  const [state, action, pending] = useActionState<UpdateRoleState, FormData>(
    updateUserRole,
    null,
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="userId" value={userId} />
      <label className="block text-sm">
        <span className={`mb-1 block text-xs ${theme.subtext}`}>Role</span>
        <select
          name="role"
          defaultValue={currentRole}
          className={theme.input}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="shrink-0"
      >
        {pending ? "Saving…" : "Update role"}
      </Button>
      {state?.error && (
        <p className="w-full text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-emerald-400">Role updated.</p>
      )}
    </form>
  );
}
