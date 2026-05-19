import { pgTable, index, foreignKey, uuid, text, numeric, timestamp, smallint, unique, bigint, jsonb, uniqueIndex, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const planning_goals = pgTable("planning_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	title: text().notNull(),
	description: text(),
	target_amount: numeric({ precision: 12, scale:  2 }).notNull(),
	target_date: timestamp({ withTimezone: true, mode: 'string' }),
	status: text().default('active').notNull(),
	priority: smallint().default(0).notNull(),
	completed_at: timestamp({ withTimezone: true, mode: 'string' }),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("planning_goals_user_status_idx").using("btree", table.user_id.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "planning_goals_user_id_fkey"
		}).onDelete("cascade"),
]);

export const planning_goal_contributions = pgTable("planning_goal_contributions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	goal_id: uuid().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	note: text(),
	contributed_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("planning_goal_contributions_goal_date_idx").using("btree", table.goal_id.asc().nullsLast().op("timestamptz_ops"), table.contributed_at.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.goal_id],
			foreignColumns: [planning_goals.id],
			name: "planning_goal_contributions_goal_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	auth_user_id: uuid(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	telegram_id: bigint({ mode: "number" }),
	email: text(),
	name: text(),
	income: numeric({ precision: 12, scale:  2 }),
	currency: text().default('ETB').notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	role: jsonb(),
}, (table) => [
	index("idx_users_auth_user_id").using("btree", table.auth_user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_users_telegram_id").using("btree", table.telegram_id.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.auth_user_id],
			foreignColumns: [table.id],
			name: "users_auth_user_id_fkey"
		}).onDelete("set null"),
	unique("users_auth_user_id_key").on(table.auth_user_id),
	unique("users_telegram_id_key").on(table.telegram_id),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid(),
	slug: text().notNull(),
	name: text().notNull(),
	sort_order: smallint().default(0).notNull(),
}, (table) => [
	uniqueIndex("categories_slug_user_idx").using("btree", table.slug.asc().nullsLast().op("text_ops"), table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "categories_user_id_fkey"
		}).onDelete("cascade"),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	category_id: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("expenses_category_idx").using("btree", table.category_id.asc().nullsLast().op("uuid_ops")),
	index("expenses_user_date_idx").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_user_id_date").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.date.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.category_id],
			foreignColumns: [categories.id],
			name: "expenses_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "expenses_user_id_fkey"
		}).onDelete("cascade"),
]);

export const budgets = pgTable("budgets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	monthly_income: numeric({ precision: 12, scale:  2 }).notNull(),
	savings_goal: numeric({ precision: 12, scale:  2 }),
	rent_limit: numeric({ precision: 12, scale:  2 }),
	food_limit: numeric({ precision: 12, scale:  2 }),
	transport_limit: numeric({ precision: 12, scale:  2 }),
	entertainment_limit: numeric({ precision: 12, scale:  2 }),
	emergency_fund: numeric({ precision: 12, scale:  2 }),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	year: smallint().notNull(),
	month: smallint().notNull(),
}, (table) => [
	uniqueIndex("budgets_user_period_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.year.asc().nullsLast().op("int2_ops"), table.month.asc().nullsLast().op("uuid_ops")),
	index("idx_budgets_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "budgets_user_id_fkey"
		}).onDelete("cascade"),
]);

export const ai_conversations = pgTable("ai_conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	message: text().notNull(),
	response: text().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ai_conversations_user_created").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.created_at.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_conversations_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "ai_conversations_user_id_fkey"
		}).onDelete("cascade"),
]);

export const budget_limits = pgTable("budget_limits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	budget_id: uuid().notNull(),
	category_id: uuid().notNull(),
	limit_amount: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	uniqueIndex("budget_limits_budget_category_idx").using("btree", table.budget_id.asc().nullsLast().op("uuid_ops"), table.category_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.budget_id],
			foreignColumns: [budgets.id],
			name: "budget_limits_budget_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.category_id],
			foreignColumns: [categories.id],
			name: "budget_limits_category_id_fkey"
		}).onDelete("cascade"),
]);

export const income_entries = pgTable("income_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	source: text().notNull(),
	description: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("income_entries_user_date_idx").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.date.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "income_entries_user_id_fkey"
		}).onDelete("cascade"),
]);

export const recurring_expenses = pgTable("recurring_expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	category_id: uuid().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: text(),
	frequency: text().notNull(),
	next_due_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	is_active: boolean().default(true).notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("recurring_expenses_user_due_idx").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.next_due_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.category_id],
			foreignColumns: [categories.id],
			name: "recurring_expenses_category_id_fkey"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "recurring_expenses_user_id_fkey"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	type: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	data: jsonb(),
	read_at: timestamp({ withTimezone: true, mode: 'string' }),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notifications_user_created_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.created_at.desc().nullsFirst().op("uuid_ops")),
	index("notifications_user_unread_idx").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.read_at.asc().nullsLast().op("timestamptz_ops")).where(sql`(read_at IS NULL)`),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);
