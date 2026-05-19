/**
 * Workaround for drizzle-kit #3766 / #4496 (Supabase introspect crash).
 * Patches every drizzle-kit copy (npm + pnpm layouts).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const before =
  'checkValue = checkValue.replace(/^CHECK\\s*\\(\\(/, "").replace(/\\)\\)\\s*$/, "");';
const after =
  'checkValue = (checkValue ?? "").replace(/^CHECK\\s*\\(\\(/, "").replace(/\\)\\)\\s*$/, "");';

function findDrizzleKitBinPaths() {
  const paths = new Set();

  const npmBin = join(root, "node_modules", "drizzle-kit", "bin.cjs");
  if (existsSync(npmBin)) paths.add(npmBin);

  const pnpmRoot = join(root, "node_modules", ".pnpm");
  if (existsSync(pnpmRoot)) {
    for (const entry of readdirSync(pnpmRoot)) {
      if (!entry.startsWith("drizzle-kit@")) continue;
      const bin = join(
        pnpmRoot,
        entry,
        "node_modules",
        "drizzle-kit",
        "bin.cjs",
      );
      if (existsSync(bin)) paths.add(bin);
    }
  }

  return [...paths];
}

function patchFile(binPath) {
  let source = readFileSync(binPath, "utf8");

  if (source.includes(after)) {
    return "already";
  }

  if (!source.includes(before)) {
    return "skipped";
  }

  source = source.split(before).join(after);
  writeFileSync(binPath, source);
  return "patched";
}

const bins = findDrizzleKitBinPaths();

if (bins.length === 0) {
  console.warn("[patch-drizzle-introspect] No drizzle-kit bin.cjs found");
  process.exit(0);
}

let patched = 0;
for (const binPath of bins) {
  const result = patchFile(binPath);
  if (result === "patched") {
    console.log(`[patch-drizzle-introspect] Patched ${binPath}`);
    patched++;
  }
}

if (patched === 0) {
  console.log("[patch-drizzle-introspect] All copies already patched");
}
