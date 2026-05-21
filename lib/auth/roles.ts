/** Supports role shapes documented on `users.role` jsonb column. */
export function isAdminRole(role: unknown): boolean {
  if (role == null) return false;
  if (typeof role === "string") return role === "admin";
  if (Array.isArray(role)) {
    return role.some((r) => r === "admin" || r === "superadmin");
  }
  if (typeof role === "object") {
    const obj = role as Record<string, unknown>;
    if (obj.admin === true || obj.superadmin === true) return true;
    if (Array.isArray(obj.roles)) {
      return obj.roles.some((r) => r === "admin" || r === "superadmin");
    }
  }
  return false;
}

export type AppRole = "user" | "admin";

export function roleToAppRole(role: unknown): AppRole {
  return isAdminRole(role) ? "admin" : "user";
}

/** Value stored in `users.role` jsonb */
export function appRoleToJson(role: AppRole): { admin: true } | null {
  return role === "admin" ? { admin: true } : null;
}

export function formatRoleLabel(role: unknown): string {
  if (role == null) return "user";
  if (typeof role === "string") return role;
  if (Array.isArray(role)) return role.join(", ") || "user";
  if (typeof role === "object") {
    const obj = role as Record<string, unknown>;
    if (Array.isArray(obj.roles)) return obj.roles.join(", ") || "user";
    const flags = Object.entries(obj)
      .filter(([, v]) => v === true)
      .map(([k]) => k);
    if (flags.length) return flags.join(", ");
  }
  return "user";
}
