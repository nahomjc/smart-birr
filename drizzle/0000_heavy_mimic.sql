-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"telegram_id" bigint,
	"email" text,
	"name" text,
	"income" numeric(12, 2),
	"currency" text DEFAULT 'ETB' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_user_id_key" UNIQUE("auth_user_id"),
	CONSTRAINT "users_telegram_id_key" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"monthly_income" numeric(12, 2) NOT NULL,
	"savings_goal" numeric(12, 2),
	"rent_limit" numeric(12, 2),
	"food_limit" numeric(12, 2),
	"transport_limit" numeric(12, 2),
	"entertainment_limit" numeric(12, 2),
	"emergency_fund" numeric(12, 2),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budget_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"limit_amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "income_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"source" text NOT NULL,
	"description" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recurring_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"frequency" text NOT NULL,
	"next_due_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_limits" ADD CONSTRAINT "budget_limits_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_limits" ADD CONSTRAINT "budget_limits_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_entries" ADD CONSTRAINT "income_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_auth_user_id" ON "users" USING btree ("auth_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_users_telegram_id" ON "users" USING btree ("telegram_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_user_idx" ON "categories" USING btree ("slug" text_ops,"user_id" text_ops);--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_user_date_idx" ON "expenses" USING btree ("user_id" timestamptz_ops,"date" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_user_id" ON "expenses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_user_id_date" ON "expenses" USING btree ("user_id" uuid_ops,"date" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_user_period_idx" ON "budgets" USING btree ("user_id" uuid_ops,"year" int2_ops,"month" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_budgets_user_id" ON "budgets" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_user_created" ON "ai_conversations" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_user_id" ON "ai_conversations" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "budget_limits_budget_category_idx" ON "budget_limits" USING btree ("budget_id" uuid_ops,"category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "income_entries_user_date_idx" ON "income_entries" USING btree ("user_id" timestamptz_ops,"date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "recurring_expenses_user_due_idx" ON "recurring_expenses" USING btree ("user_id" timestamptz_ops,"next_due_at" timestamptz_ops);
*/