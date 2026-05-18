import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Supabase Auth user id (auth.users.id) */
  authUserId: uuid("auth_user_id").unique(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique(),
  email: text("email"),
  name: text("name"),
  income: numeric("income", { precision: 12, scale: 2 }),
  currency: text("currency").default("ETB").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  monthlyIncome: numeric("monthly_income", {
    precision: 12,
    scale: 2,
  }).notNull(),
  savingsGoal: numeric("savings_goal", { precision: 12, scale: 2 }),
  rentLimit: numeric("rent_limit", { precision: 12, scale: 2 }),
  foodLimit: numeric("food_limit", { precision: 12, scale: 2 }),
  transportLimit: numeric("transport_limit", { precision: 12, scale: 2 }),
  entertainmentLimit: numeric("entertainment_limit", {
    precision: 12,
    scale: 2,
  }),
  emergencyFund: numeric("emergency_fund", { precision: 12, scale: 2 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
