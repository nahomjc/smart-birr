import { relations } from "drizzle-orm/relations";
import { users, planning_goals, planning_goal_contributions, usersInAuth, categories, expenses, budgets, ai_conversations, budget_limits, income_entries, recurring_expenses, campaigns, telegram_sessions, notifications } from "./schema";

export const planning_goalsRelations = relations(planning_goals, ({one, many}) => ({
	user: one(users, {
		fields: [planning_goals.user_id],
		references: [users.id]
	}),
	planning_goal_contributions: many(planning_goal_contributions),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	planning_goals: many(planning_goals),
	usersInAuth: one(usersInAuth, {
		fields: [users.auth_user_id],
		references: [usersInAuth.id]
	}),
	expenses: many(expenses),
	categories: many(categories),
	budgets: many(budgets),
	ai_conversations: many(ai_conversations),
	income_entries: many(income_entries),
	recurring_expenses: many(recurring_expenses),
	campaigns: many(campaigns),
	telegram_sessions: many(telegram_sessions),
	notifications: many(notifications),
}));

export const planning_goal_contributionsRelations = relations(planning_goal_contributions, ({one}) => ({
	planning_goal: one(planning_goals, {
		fields: [planning_goal_contributions.goal_id],
		references: [planning_goals.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	category: one(categories, {
		fields: [expenses.category_id],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [expenses.user_id],
		references: [users.id]
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	expenses: many(expenses),
	user: one(users, {
		fields: [categories.user_id],
		references: [users.id]
	}),
	budget_limits: many(budget_limits),
	recurring_expenses: many(recurring_expenses),
}));

export const budgetsRelations = relations(budgets, ({one, many}) => ({
	user: one(users, {
		fields: [budgets.user_id],
		references: [users.id]
	}),
	budget_limits: many(budget_limits),
}));

export const ai_conversationsRelations = relations(ai_conversations, ({one}) => ({
	user: one(users, {
		fields: [ai_conversations.user_id],
		references: [users.id]
	}),
}));

export const budget_limitsRelations = relations(budget_limits, ({one}) => ({
	budget: one(budgets, {
		fields: [budget_limits.budget_id],
		references: [budgets.id]
	}),
	category: one(categories, {
		fields: [budget_limits.category_id],
		references: [categories.id]
	}),
}));

export const income_entriesRelations = relations(income_entries, ({one}) => ({
	user: one(users, {
		fields: [income_entries.user_id],
		references: [users.id]
	}),
}));

export const recurring_expensesRelations = relations(recurring_expenses, ({one}) => ({
	category: one(categories, {
		fields: [recurring_expenses.category_id],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [recurring_expenses.user_id],
		references: [users.id]
	}),
}));

export const campaignsRelations = relations(campaigns, ({one}) => ({
	user: one(users, {
		fields: [campaigns.created_by_user_id],
		references: [users.id]
	}),
}));

export const telegram_sessionsRelations = relations(telegram_sessions, ({one}) => ({
	user: one(users, {
		fields: [telegram_sessions.user_id],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.user_id],
		references: [users.id]
	}),
}));