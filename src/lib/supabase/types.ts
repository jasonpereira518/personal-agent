// Hand-written until `npx supabase gen types` is wired up in a later phase.
// Matches 001_initial_schema.sql. Insert/Update defined flat (no circular Partial<Database[...]>).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Row shapes (standalone, no circular refs) ─────────────────
type UsersProfileRow = {
  id: string; user_id: string; name: string; email: string
  location: string | null; timezone: string; preferences: Json
  created_at: string; updated_at: string
}
type TaskRow = {
  id: string; user_id: string; title: string; notes: string | null
  status: "active" | "completed" | "archived"; is_starred: boolean
  priority: number; project_id: string | null; due_at: string | null
  completed_at: string | null; apple_list_name: string | null
  apple_reminder_id: string | null
  source: "dashboard" | "shortcuts_ios" | "siri" | "reminders"
  tags: string[]; created_at: string; updated_at: string
}
type ProjectRow = {
  id: string; user_id: string; name: string; description: string | null
  status: "active" | "on_hold" | "completed" | "archived"
  color: string; created_at: string; updated_at: string
}
type SemesterRow = {
  id: string; user_id: string; name: string
  season: "spring" | "summer" | "fall" | "winter"
  year: number; start_date: string; end_date: string
  is_current: boolean; created_at: string
}
type HabitRow = {
  id: string; user_id: string; name: string; description: string | null
  frequency: "daily" | "weekly" | "monthly"
  target_days_per_week: number; color: string; is_active: boolean
  created_at: string; updated_at: string
}
type HabitLogRow = {
  id: string; user_id: string; habit_id: string
  completed_on: string; notes: string | null; created_at: string
}
type CalendarAccountRow = {
  id: string; user_id: string
  provider: "google" | "exchange" | "icloud" | "outlook"
  name: string; email: string | null; access_token: string | null
  refresh_token: string | null; token_expires_at: string | null
  is_active: boolean; created_at: string; updated_at: string
}
type PaycheckScheduleRow = {
  id: string; user_id: string; employer: string; frequency: string
  day_of_week: number | null; anchor_date: string
  amount: number | null; currency: string
  is_active: boolean; created_at: string
}
type CaptureWebhookLogRow = {
  id: string; user_id: string | null; device_token_id: string | null
  source: string | null; payload_preview: string | null
  status_code: number | null; error_message: string | null
  ip_address: string | null; user_agent: string | null; created_at: string
}
type PersonRow = {
  id: string; user_id: string; name: string; email: string | null
  phone: string | null; notes: string | null; relationship: string | null
  created_at: string; updated_at: string
}
type EventRow = {
  id: string; user_id: string; calendar_account_id: string | null
  title: string; description: string | null; location: string | null
  start_at: string; end_at: string; is_all_day: boolean
  recurrence_rule: string | null; external_id: string | null
  created_at: string; updated_at: string
}
type GoalRow = {
  id: string; user_id: string; title: string; description: string | null
  category: string | null
  timeframe: "yearly" | "monthly" | "weekly" | "daily"
  target_date: string | null
  status: "active" | "completed" | "archived"
  progress_pct: number; parent_goal_id: string | null
  created_at: string; updated_at: string
}
type JournalEntryRow = {
  id: string; user_id: string; content: string
  mood: number | null; mood_label: string | null
  tags: string[]; entry_date: string; created_at: string; updated_at: string
}
type JobApplicationRow = {
  id: string; user_id: string; company: string; role: string
  status: "researching" | "applied" | "phone_screen" | "interview" | "offer" | "accepted" | "rejected" | "withdrawn"
  applied_at: string | null; deadline_at: string | null
  notes: string | null; source: string | null; url: string | null
  salary_min: number | null; salary_max: number | null
  is_fellowship: boolean; created_at: string; updated_at: string
}
type NoteRow = {
  id: string; user_id: string; title: string | null; content: string
  tags: string[]; source: string; parent_note_id: string | null
  is_pinned: boolean; created_at: string; updated_at: string
}

// ── Database type ─────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: UsersProfileRow
        Insert: { user_id: string; name: string; email: string } & Partial<Omit<UsersProfileRow, "user_id" | "name" | "email">>
        Update: Partial<UsersProfileRow>
        Relationships: []
      }
      tasks: {
        Row: TaskRow
        Insert: { user_id: string; title: string } & Partial<Omit<TaskRow, "user_id" | "title">>
        Update: Partial<TaskRow>
        Relationships: []
      }
      projects: {
        Row: ProjectRow
        Insert: { user_id: string; name: string } & Partial<Omit<ProjectRow, "user_id" | "name">>
        Update: Partial<ProjectRow>
        Relationships: []
      }
      semesters: {
        Row: SemesterRow
        Insert: { user_id: string; name: string; season: SemesterRow["season"]; year: number; start_date: string; end_date: string } & Partial<Omit<SemesterRow, "user_id" | "name" | "season" | "year" | "start_date" | "end_date">>
        Update: Partial<SemesterRow>
        Relationships: []
      }
      habits: {
        Row: HabitRow
        Insert: { user_id: string; name: string } & Partial<Omit<HabitRow, "user_id" | "name">>
        Update: Partial<HabitRow>
        Relationships: []
      }
      habit_logs: {
        Row: HabitLogRow
        Insert: { user_id: string; habit_id: string; completed_on: string } & Partial<Omit<HabitLogRow, "user_id" | "habit_id" | "completed_on">>
        Update: Partial<HabitLogRow>
        Relationships: []
      }
      calendar_accounts: {
        Row: CalendarAccountRow
        Insert: { user_id: string; provider: CalendarAccountRow["provider"]; name: string } & Partial<Omit<CalendarAccountRow, "user_id" | "provider" | "name">>
        Update: Partial<CalendarAccountRow>
        Relationships: []
      }
      paycheck_schedules: {
        Row: PaycheckScheduleRow
        Insert: { user_id: string; employer: string; anchor_date: string } & Partial<Omit<PaycheckScheduleRow, "user_id" | "employer" | "anchor_date">>
        Update: Partial<PaycheckScheduleRow>
        Relationships: []
      }
      capture_webhook_log: {
        Row: CaptureWebhookLogRow
        Insert: Partial<CaptureWebhookLogRow>
        Update: Partial<CaptureWebhookLogRow>
        Relationships: []
      }
      people: {
        Row: PersonRow
        Insert: { user_id: string; name: string } & Partial<Omit<PersonRow, "user_id" | "name">>
        Update: Partial<PersonRow>
        Relationships: []
      }
      events: {
        Row: EventRow
        Insert: { user_id: string; title: string; start_at: string; end_at: string } & Partial<Omit<EventRow, "user_id" | "title" | "start_at" | "end_at">>
        Update: Partial<EventRow>
        Relationships: []
      }
      goals: {
        Row: GoalRow
        Insert: { user_id: string; title: string } & Partial<Omit<GoalRow, "user_id" | "title">>
        Update: Partial<GoalRow>
        Relationships: []
      }
      journal_entries: {
        Row: JournalEntryRow
        Insert: { user_id: string; content: string; entry_date: string } & Partial<Omit<JournalEntryRow, "user_id" | "content" | "entry_date">>
        Update: Partial<JournalEntryRow>
        Relationships: []
      }
      job_applications: {
        Row: JobApplicationRow
        Insert: { user_id: string; company: string; role: string } & Partial<Omit<JobApplicationRow, "user_id" | "company" | "role">>
        Update: Partial<JobApplicationRow>
        Relationships: []
      }
      notes: {
        Row: NoteRow
        Insert: { user_id: string; content: string } & Partial<Omit<NoteRow, "user_id" | "content">>
        Update: Partial<NoteRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_status: "active" | "completed" | "archived"
      task_source: "dashboard" | "shortcuts_ios" | "siri" | "reminders"
    }
    CompositeTypes: Record<string, never>
  }
}
