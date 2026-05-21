import { and, asc, desc, eq, lte } from "drizzle-orm";
import { requireDb, recurringExpenses } from "../db";
import { getCategoryByName } from "../db/seed-categories";
import { normalizeCategory } from "./categories";
import { advanceDueDate } from "./period";
import { logExpense } from "./expense-service";

export type RecurringFrequency = "monthly" | "weekly";

export async function createRecurringExpense(
  userId: string,
  data: {
    amount: number;
    category: string;
    description?: string | null;
    frequency: RecurringFrequency;
    nextDueAt?: Date;
  },
) {
  const db = requireDb();
  const categoryName = normalizeCategory(data.category);
  const category = await getCategoryByName(categoryName);
  if (!category) {
    throw new Error(`Unknown category: ${categoryName}`);
  }

  const [row] = await db
    .insert(recurringExpenses)
    .values({
      userId,
      categoryId: category.id,
      amount: String(data.amount),
      description: data.description ?? null,
      frequency: data.frequency,
      nextDueAt: data.nextDueAt ?? new Date(),
    })
    .returning();
  return row;
}

export async function getActiveRecurringExpenses(userId: string) {
  const db = requireDb();
  return db.query.recurringExpenses.findMany({
    where: and(
      eq(recurringExpenses.userId, userId),
      eq(recurringExpenses.isActive, true),
    ),
    with: { category: true },
    orderBy: [asc(recurringExpenses.nextDueAt)],
  });
}

export async function getUserRecurringExpenses(userId: string) {
  const db = requireDb();
  return db.query.recurringExpenses.findMany({
    where: eq(recurringExpenses.userId, userId),
    with: { category: true },
    orderBy: [
      desc(recurringExpenses.isActive),
      asc(recurringExpenses.nextDueAt),
    ],
  });
}

export async function getRecurringExpenseForUser(
  userId: string,
  id: string,
) {
  const db = requireDb();
  return db.query.recurringExpenses.findFirst({
    where: and(
      eq(recurringExpenses.id, id),
      eq(recurringExpenses.userId, userId),
    ),
    with: { category: true },
  });
}

export async function updateRecurringExpense(
  userId: string,
  id: string,
  data: {
    amount?: number;
    category?: string;
    description?: string | null;
    frequency?: RecurringFrequency;
    nextDueAt?: Date;
    isActive?: boolean;
  },
) {
  const db = requireDb();
  const existing = await getRecurringExpenseForUser(userId, id);
  if (!existing) {
    throw new Error("Recurring bill not found");
  }

  const patch: {
    amount?: string;
    categoryId?: string;
    description?: string | null;
    frequency?: string;
    nextDueAt?: Date;
    isActive?: boolean;
  } = {};

  if (data.amount != null && data.amount > 0) {
    patch.amount = String(data.amount);
  }
  if (data.description !== undefined) {
    patch.description = data.description;
  }
  if (data.frequency) {
    patch.frequency = data.frequency;
  }
  if (data.nextDueAt) {
    patch.nextDueAt = data.nextDueAt;
  }
  if (data.isActive !== undefined) {
    patch.isActive = data.isActive;
  }
  if (data.category) {
    const categoryName = normalizeCategory(data.category);
    const category = await getCategoryByName(categoryName);
    if (!category) {
      throw new Error(`Unknown category: ${categoryName}`);
    }
    patch.categoryId = category.id;
  }

  if (Object.keys(patch).length === 0) {
    return existing;
  }

  const [row] = await db
    .update(recurringExpenses)
    .set(patch)
    .where(
      and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)),
    )
    .returning();

  return getRecurringExpenseForUser(userId, row.id);
}

/** Log due recurring items as expenses and advance their next due date */
export async function processDueRecurringExpenses(userId: string) {
  const db = requireDb();
  const now = new Date();
  const due = await db.query.recurringExpenses.findMany({
    where: and(
      eq(recurringExpenses.userId, userId),
      eq(recurringExpenses.isActive, true),
      lte(recurringExpenses.nextDueAt, now),
    ),
    with: { category: true },
  });

  const logged: { id: string; amount: number; category: string }[] = [];

  for (const item of due) {
    await logExpense(
      userId,
      Number(item.amount),
      item.category.name,
      item.description ?? `Recurring: ${item.category.name}`,
    );
    const frequency = item.frequency as RecurringFrequency;
    await db
      .update(recurringExpenses)
      .set({ nextDueAt: advanceDueDate(item.nextDueAt, frequency) })
      .where(eq(recurringExpenses.id, item.id));
    logged.push({
      id: item.id,
      amount: Number(item.amount),
      category: item.category.name,
    });
  }

  return logged;
}
