/**
 * Patches drizzle-kit (pnpm-safe) then runs introspect.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const patch = spawnSync(process.execPath, ["scripts/patch-drizzle-introspect.mjs"], {
  cwd: root,
  stdio: "inherit",
});

if (patch.status !== 0) {
  process.exit(patch.status ?? 1);
}

const introspect = spawnSync(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "drizzle-kit", "introspect"],
  { cwd: root, stdio: "inherit", shell: true },
);

process.exit(introspect.status ?? 1);
