import { and, eq, isNull } from "drizzle-orm";
import { requireDb, categories } from "./index";
import { EXPENSE_CATEGORIES } from "../finance/categories";

const SYSTEM_CATEGORY_ROWS = EXPENSE_CATEGORIES.map((name, i) => ({
  slug: name.toLowerCase(),
  name,
  sortOrder: i,
}));

export async function ensureSystemCategories() {
  const db = requireDb();
  for (const row of SYSTEM_CATEGORY_ROWS) {
    const existing = await db.query.categories.findFirst({
      where: and(eq(categories.slug, row.slug), isNull(categories.userId)),
    });
    if (!existing) {
      await db.insert(categories).values({
        slug: row.slug,
        name: row.name,
        sortOrder: row.sortOrder,
        userId: null,
      });
    }
  }
}

export async function getCategoryBySlug(slug: string) {
  const db = requireDb();
  await ensureSystemCategories();
  const normalized = slug.toLowerCase().trim();
  return db.query.categories.findFirst({
    where: and(eq(categories.slug, normalized), isNull(categories.userId)),
  });
}

export async function getCategoryByName(name: string) {
  return getCategoryBySlug(name);
}
