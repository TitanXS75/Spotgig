# Aaspass — Database Setup

All database tables, enums, triggers, and Row Level Security (RLS) policies are consolidated into a single clean file:

👉 **[`setup.sql`](file:///c:/Users/rohit/OneDrive/Desktop/Aaspass/sqldb/setup.sql)**

---

## How to Run

### Option 1 — In Supabase Web Dashboard (Recommended, ~10 seconds)
1. Open your project dashboard at [supabase.com](https://supabase.com).
2. In the left navigation bar, click **SQL Editor** (icon `>_`).
3. Click **New query**.
4. Copy the entire contents of [sqldb/setup.sql](file:///c:/Users/rohit/OneDrive/Desktop/Aaspass/sqldb/setup.sql) and paste it into the editor.
5. Click **Run** (or press `Ctrl + Enter`).

Everything (enums, profiles, projects, private requirements, requests, workspace tasks, real-time chat, deliverables, reviews, and RLS policies) will be created instantly and safely!

---

### Option 2 — Via Supabase CLI (if logged in)
If you have a Supabase access token:
```bash
npx supabase db query --file sqldb/setup.sql --project-ref YOUR_PROJECT_ID
```
Or with direct database connection string:
```bash
npx supabase db query --file sqldb/setup.sql --db-url "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```
