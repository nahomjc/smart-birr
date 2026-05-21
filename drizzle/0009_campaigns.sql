CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_by_user_id" uuid,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "audience" text NOT NULL,
  "recipient_ids" jsonb,
  "send_in_app" boolean DEFAULT true NOT NULL,
  "send_email" boolean DEFAULT false NOT NULL,
  "recipient_count" smallint NOT NULL,
  "in_app_sent" smallint DEFAULT 0 NOT NULL,
  "email_sent" smallint DEFAULT 0 NOT NULL,
  "email_failed" smallint DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE "campaigns"
  ADD CONSTRAINT "campaigns_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id")
  REFERENCES "public"."users"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS "campaigns_created_at_idx" ON "campaigns" ("created_at");
CREATE INDEX IF NOT EXISTS "campaigns_created_by_idx" ON "campaigns" ("created_by_user_id");
