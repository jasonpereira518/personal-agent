-- ============================================================
-- Personal OS — Initial Schema
-- All user_id columns store Clerk user IDs (TEXT, e.g. user_2abc…)
-- RLS uses (auth.jwt() ->> 'sub') which Clerk sets to the user ID
-- automatically — no sub claim override needed in the JWT template.
-- ============================================================

-- Helper: auto-update updated_at (goes in public schema — no permission issue)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE task_status       AS ENUM ('active','completed','archived');
CREATE TYPE task_source       AS ENUM ('dashboard','shortcuts_ios','siri','reminders');
CREATE TYPE semester_season   AS ENUM ('spring','summer','fall','winter');
CREATE TYPE project_status    AS ENUM ('active','on_hold','completed','archived');
CREATE TYPE habit_frequency   AS ENUM ('daily','weekly','monthly');
CREATE TYPE calendar_provider AS ENUM ('google','exchange','icloud','outlook');
CREATE TYPE app_status        AS ENUM ('researching','applied','phone_screen','interview','offer','accepted','rejected','withdrawn');
CREATE TYPE goal_timeframe    AS ENUM ('yearly','monthly','weekly','daily');
CREATE TYPE goal_status       AS ENUM ('active','completed','archived');

-- ── 1. users_profile ─────────────────────────────────────────
CREATE TABLE users_profile (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT    UNIQUE NOT NULL,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  location    TEXT,
  timezone    TEXT    NOT NULL DEFAULT 'America/New_York',
  preferences JSONB   NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER users_profile_updated_at BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY up_all ON users_profile FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 2. semesters ─────────────────────────────────────────────
CREATE TABLE semesters (
  id         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT            NOT NULL,
  name       TEXT            NOT NULL,
  season     semester_season NOT NULL,
  year       INT             NOT NULL,
  start_date DATE            NOT NULL,
  end_date   DATE            NOT NULL,
  is_current BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
CREATE POLICY sem_all ON semesters FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 3. projects ──────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT           NOT NULL,
  name        TEXT           NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'active',
  color       TEXT           DEFAULT '#7F77DD',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY proj_all ON projects FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 4. courses ───────────────────────────────────────────────
CREATE TABLE courses (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT  NOT NULL,
  semester_id UUID  REFERENCES semesters ON DELETE CASCADE,
  code        TEXT  NOT NULL,
  name        TEXT  NOT NULL,
  credits     NUMERIC(3,1),
  instructor  TEXT,
  color       TEXT,
  canvas_id   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY crs_all ON courses FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 5. assignments ───────────────────────────────────────────
CREATE TABLE assignments (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT  NOT NULL,
  course_id   UUID  REFERENCES courses ON DELETE CASCADE,
  title       TEXT  NOT NULL,
  description TEXT,
  due_at      TIMESTAMPTZ,
  weight      NUMERIC(5,2),
  status      TEXT  NOT NULL DEFAULT 'pending',
  grade       NUMERIC(5,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER asgn_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY asgn_all ON assignments FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 6. tasks ─────────────────────────────────────────────────
CREATE TABLE tasks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  notes             TEXT,
  status            task_status NOT NULL DEFAULT 'active',
  is_starred        BOOLEAN     NOT NULL DEFAULT FALSE,
  priority          INT         NOT NULL DEFAULT 0,
  project_id        UUID        REFERENCES projects ON DELETE SET NULL,
  due_at            TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  apple_list_name   TEXT,
  apple_reminder_id TEXT,
  source            task_source NOT NULL DEFAULT 'dashboard',
  tags              TEXT[]      NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX tasks_user_status_idx  ON tasks(user_id, status);
CREATE INDEX tasks_user_starred_idx ON tasks(user_id, is_starred) WHERE status = 'active';
CREATE INDEX tasks_user_due_idx     ON tasks(user_id, due_at)      WHERE status = 'active';
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_all ON tasks FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 7. people ────────────────────────────────────────────────
CREATE TABLE people (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT  NOT NULL,
  name         TEXT  NOT NULL,
  email        TEXT,
  phone        TEXT,
  notes        TEXT,
  relationship TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
CREATE POLICY people_all ON people FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 8. task_assignments ──────────────────────────────────────
CREATE TABLE task_assignments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  task_id    UUID NOT NULL REFERENCES tasks    ON DELETE CASCADE,
  person_id  UUID NOT NULL REFERENCES people   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, person_id)
);
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ta_all ON task_assignments FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 9. calendar_accounts ─────────────────────────────────────
CREATE TABLE calendar_accounts (
  id               UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT              NOT NULL,
  provider         calendar_provider NOT NULL,
  name             TEXT              NOT NULL,
  email            TEXT,
  access_token     TEXT,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active        BOOLEAN           NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE TRIGGER cal_updated_at BEFORE UPDATE ON calendar_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE calendar_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cal_all ON calendar_accounts FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 10. events ───────────────────────────────────────────────
CREATE TABLE events (
  id                  UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT  NOT NULL,
  calendar_account_id UUID  REFERENCES calendar_accounts ON DELETE SET NULL,
  title               TEXT  NOT NULL,
  description         TEXT,
  location            TEXT,
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ NOT NULL,
  is_all_day          BOOLEAN     NOT NULL DEFAULT FALSE,
  recurrence_rule     TEXT,
  external_id         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX events_user_start_idx ON events(user_id, start_at);
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_all ON events FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 11. financial_accounts ───────────────────────────────────
CREATE TABLE financial_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL,
  institution      TEXT,
  plaid_account_id TEXT,
  current_balance  NUMERIC(14,2),
  currency         TEXT    NOT NULL DEFAULT 'USD',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER fa_updated_at BEFORE UPDATE ON financial_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY fa_all ON financial_accounts FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 12. transactions ─────────────────────────────────────────
CREATE TABLE transactions (
  id                   UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT  NOT NULL,
  account_id           UUID  REFERENCES financial_accounts ON DELETE SET NULL,
  plaid_transaction_id TEXT,
  description          TEXT  NOT NULL,
  amount               NUMERIC(12,2) NOT NULL,
  currency             TEXT  NOT NULL DEFAULT 'USD',
  date                 DATE  NOT NULL,
  category             TEXT,
  merchant_name        TEXT,
  notes                TEXT,
  is_recurring         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX txn_user_date_idx ON transactions(user_id, date DESC);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY txn_all ON transactions FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 13. budgets ──────────────────────────────────────────────
CREATE TABLE budgets (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT  NOT NULL,
  category   TEXT  NOT NULL,
  amount     NUMERIC(12,2) NOT NULL,
  period     TEXT  NOT NULL DEFAULT 'monthly',
  color      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_all ON budgets FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 14. paycheck_schedules ───────────────────────────────────
CREATE TABLE paycheck_schedules (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT  NOT NULL,
  employer    TEXT  NOT NULL,
  frequency   TEXT  NOT NULL DEFAULT 'biweekly',
  day_of_week INT,
  anchor_date DATE  NOT NULL,
  amount      NUMERIC(12,2),
  currency    TEXT  NOT NULL DEFAULT 'USD',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE paycheck_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY ps_all ON paycheck_schedules FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 15. habits ───────────────────────────────────────────────
CREATE TABLE habits (
  id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT            NOT NULL,
  name                 TEXT            NOT NULL,
  description          TEXT,
  frequency            habit_frequency NOT NULL DEFAULT 'daily',
  target_days_per_week INT             NOT NULL DEFAULT 7,
  color                TEXT            DEFAULT '#7F77DD',
  is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE TRIGGER habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY habits_all ON habits FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 16. habit_logs ───────────────────────────────────────────
CREATE TABLE habit_logs (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT  NOT NULL,
  habit_id     UUID  NOT NULL REFERENCES habits ON DELETE CASCADE,
  completed_on DATE  NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completed_on)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY hl_all ON habit_logs FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 17. goals ────────────────────────────────────────────────
CREATE TABLE goals (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT           NOT NULL,
  title          TEXT           NOT NULL,
  description    TEXT,
  category       TEXT,
  timeframe      goal_timeframe NOT NULL DEFAULT 'monthly',
  target_date    DATE,
  status         goal_status    NOT NULL DEFAULT 'active',
  progress_pct   INT            NOT NULL DEFAULT 0,
  parent_goal_id UUID           REFERENCES goals ON DELETE SET NULL,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_all ON goals FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 18. goal_milestones ──────────────────────────────────────
CREATE TABLE goal_milestones (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT  NOT NULL,
  goal_id      UUID  NOT NULL REFERENCES goals ON DELETE CASCADE,
  title        TEXT  NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_at       TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY gm_all ON goal_milestones FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 19. journal_entries ──────────────────────────────────────
CREATE TABLE journal_entries (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT  NOT NULL,
  content    TEXT  NOT NULL,
  mood       INT   CHECK (mood BETWEEN 1 AND 5),
  mood_label TEXT,
  tags       TEXT[] NOT NULL DEFAULT '{}',
  entry_date DATE   NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX je_user_date_idx ON journal_entries(user_id, entry_date DESC);
CREATE TRIGGER je_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY je_all ON journal_entries FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 20. health_logs ──────────────────────────────────────────
CREATE TABLE health_logs (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT  NOT NULL,
  log_date         DATE  NOT NULL,
  workout_type     TEXT,
  duration_minutes INT,
  calories         INT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY hlth_all ON health_logs FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 21. sleep_logs ───────────────────────────────────────────
CREATE TABLE sleep_logs (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT  NOT NULL,
  sleep_date       DATE  NOT NULL,
  bedtime          TIMESTAMPTZ,
  wake_time        TIMESTAMPTZ,
  duration_minutes INT,
  quality_score    INT   CHECK (quality_score BETWEEN 1 AND 5),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sl_all ON sleep_logs FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 22. job_applications ─────────────────────────────────────
CREATE TABLE job_applications (
  id            UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT       NOT NULL,
  company       TEXT       NOT NULL,
  role          TEXT       NOT NULL,
  status        app_status NOT NULL DEFAULT 'researching',
  applied_at    DATE,
  deadline_at   DATE,
  notes         TEXT,
  source        TEXT,
  url           TEXT,
  salary_min    INT,
  salary_max    INT,
  is_fellowship BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER ja_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY ja_all ON job_applications FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 23. application_contacts ─────────────────────────────────
CREATE TABLE application_contacts (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT  NOT NULL,
  application_id UUID  NOT NULL REFERENCES job_applications ON DELETE CASCADE,
  name           TEXT  NOT NULL,
  role           TEXT,
  email          TEXT,
  linkedin_url   TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE application_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ac_all ON application_contacts FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 24. notes ────────────────────────────────────────────────
CREATE TABLE notes (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT  NOT NULL,
  title          TEXT,
  content        TEXT  NOT NULL,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  source         TEXT   NOT NULL DEFAULT 'manual',
  parent_note_id UUID   REFERENCES notes ON DELETE SET NULL,
  is_pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_all ON notes FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 25. note_links ───────────────────────────────────────────
CREATE TABLE note_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  source_id  UUID NOT NULL REFERENCES notes ON DELETE CASCADE,
  target_id  UUID NOT NULL REFERENCES notes ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY nl_all ON note_links FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ── 26. recurring_transactions ───────────────────────────────
CREATE TABLE recurring_transactions (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT  NOT NULL,
  account_id  UUID  REFERENCES financial_accounts ON DELETE SET NULL,
  description TEXT  NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT  NOT NULL DEFAULT 'USD',
  frequency   TEXT  NOT NULL,
  next_date   DATE,
  category    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER rt_updated_at BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rt_all ON recurring_transactions FOR ALL
  USING ((auth.jwt() ->> 'sub') = user_id);
