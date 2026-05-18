import { relations } from "drizzle-orm";
import { users, expenses, budgets, aiConversations } from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  expenses: many(expenses),
  budget: one(budgets),
  conversations: many(aiConversations),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
}));
