import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  bigint,
  boolean,
  smallint,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Supabase Auth user id (auth.users.id) */
  authUserId: uuid("auth_user_id").unique(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique(),
  email: text("email"),
  name: text("name"),
  /** Latest known monthly income (synced from current budget) */
  income: numeric("income", { precision: 12, scale: 2 }),
  currency: text("currency").default("ETB").notNull(),
  /** e.g. ["user"] or { "admin": true } */
  role: jsonb("role"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null = system default category */
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_user_idx").on(table.slug, table.userId),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    /** 0–1 confidence when logged via AI (Telegram/web chat) */
    aiConfidence: numeric("ai_confidence", { precision: 4, scale: 3 }),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("expenses_user_date_idx").on(table.userId, table.date),
    index("expenses_category_idx").on(table.categoryId),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: smallint("year").notNull(),
    month: smallint("month").notNull(),
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
  },
  (table) => [
    uniqueIndex("budgets_user_period_idx").on(
      table.userId,
      table.year,
      table.month,
    ),
  ],
);

export const budgetLimits = pgTable(
  "budget_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    limitAmount: numeric("limit_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("budget_limits_budget_category_idx").on(
      table.budgetId,
      table.categoryId,
    ),
  ],
);

export const incomeEntries = pgTable(
  "income_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    source: text("source").notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("income_entries_user_date_idx").on(table.userId, table.date),
  ],
);

export const recurringExpenses = pgTable(
  "recurring_expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    frequency: text("frequency").notNull(),
    nextDueAt: timestamp("next_due_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("recurring_expenses_user_due_idx").on(
      table.userId,
      table.nextDueAt,
    ),
  ],
);

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

export const planningGoals = pgTable(
  "planning_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetAmount: numeric("target_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    targetDate: timestamp("target_date", { withTimezone: true }),
    status: text("status").default("active").notNull(),
    priority: smallint("priority").default(0).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("planning_goals_user_status_idx").on(table.userId, table.status),
  ],
);

export const planningGoalContributions = pgTable(
  "planning_goal_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => planningGoals.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    note: text("note"),
    contributedAt: timestamp("contributed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("planning_goal_contributions_goal_date_idx").on(
      table.goalId,
      table.contributedAt,
    ),
  ],
);

/** Email OTP codes for forgot-password (hashed). */
export const passwordResetOtps = pgTable(
  "password_reset_otps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    /** Supabase auth.users.id */
    authUserId: uuid("auth_user_id").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: smallint("attempts").default(0).notNull(),
    maxAttempts: smallint("max_attempts").default(5).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("password_reset_otps_email_created_idx").on(
      table.email,
      table.createdAt,
    ),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_unread_idx").on(table.userId, table.readAt),
  ],
);

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type BudgetLimit = typeof budgetLimits.$inferSelect;
export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type PasswordResetOtp = typeof passwordResetOtps.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type PlanningGoal = typeof planningGoals.$inferSelect;
export type PlanningGoalContribution =
  typeof planningGoalContributions.$inferSelect;

export type PlanningGoalStatus =
  | "active"
  | "paused"
  | "completed"
  | "cancelled";
