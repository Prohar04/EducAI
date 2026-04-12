-- AddTable: scholarship_alert_logs
-- Tracks which deadline alerts have been dispatched per user to prevent duplicates.

CREATE TABLE IF NOT EXISTS "scholarship_alert_logs" (
  "id"               TEXT        NOT NULL,
  "user_id"          UUID        NOT NULL,
  "scholarship_id"   TEXT        NOT NULL,
  "deadline_id"      TEXT        NOT NULL,
  "days_before_sent" INTEGER     NOT NULL,
  "sent_at"          TIMESTAMP   NOT NULL DEFAULT NOW(),
  "channel"          VARCHAR(20) NOT NULL DEFAULT 'email',

  CONSTRAINT "scholarship_alert_logs_pkey" PRIMARY KEY ("id")
);

-- FK → users
DO $$ BEGIN
  ALTER TABLE "scholarship_alert_logs"
    ADD CONSTRAINT "scholarship_alert_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Unique: one alert per (user, deadline, window, channel)
DO $$ BEGIN
  ALTER TABLE "scholarship_alert_logs"
    ADD CONSTRAINT "scholarship_alert_logs_user_id_deadline_id_days_before_sent_channel_key"
    UNIQUE ("user_id", "deadline_id", "days_before_sent", "channel");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "scholarship_alert_logs_user_id_idx"  ON "scholarship_alert_logs"("user_id");
CREATE INDEX IF NOT EXISTS "scholarship_alert_logs_sent_at_idx"  ON "scholarship_alert_logs"("sent_at");
