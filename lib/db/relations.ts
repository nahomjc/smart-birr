import { relations } from "drizzle-orm";
import {
  users,
  categories,
  expenses,
  budgets,
  budgetLimits,
  incomeEntries,
  recurringExpenses,
  aiConversations,
  planningGoals,
  planningGoalContributions,
  campaigns,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  budgets: many(budgets),
  incomeEntries: many(incomeEntries),
  recurringExpenses: many(recurringExpenses),
  conversations: many(aiConversations),
  customCategories: many(categories),
  planningGoals: many(planningGoals),
  campaignsCreated: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  createdBy: one(users, {
    fields: [campaigns.createdByUserId],
    references: [users.id],
  }),
}));

export const planningGoalsRelations = relations(
  planningGoals,
  ({ one, many }) => ({
    user: one(users, {
      fields: [planningGoals.userId],
      references: [users.id],
    }),
    contributions: many(planningGoalContributions),
  }),
);

export const planningGoalContributionsRelations = relations(
  planningGoalContributions,
  ({ one }) => ({
    goal: one(planningGoals, {
      fields: [planningGoalContributions.goalId],
      references: [planningGoals.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
  budgetLimits: many(budgetLimits),
  recurringExpenses: many(recurringExpenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  limits: many(budgetLimits),
}));

export const budgetLimitsRelations = relations(budgetLimits, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetLimits.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [budgetLimits.categoryId],
    references: [categories.id],
  }),
}));

export const incomeEntriesRelations = relations(incomeEntries, ({ one }) => ({
  user: one(users, {
    fields: [incomeEntries.userId],
    references: [users.id],
  }),
}));

export const recurringExpensesRelations = relations(
  recurringExpenses,
  ({ one }) => ({
    user: one(users, {
      fields: [recurringExpenses.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [recurringExpenses.categoryId],
      references: [categories.id],
    }),
  }),
);

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
}));
