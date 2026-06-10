create extension if not exists "pgcrypto";

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists quests (
  id text primary key,
  title text not null,
  description text not null,
  lesson text not null,
  created_at timestamptz not null default now()
);

create table if not exists rounds (
  id text primary key,
  quest_id text not null references quests(id) on delete cascade,
  order_index int not null,
  title text not null,
  story text not null,
  cipher_type text not null,
  cipher_key text not null,
  final_question text not null,
  accepted_answers jsonb not null default '[]',
  explanation text not null
);

create table if not exists clues (
  id text primary key,
  round_id text not null references rounds(id) on delete cascade,
  clue_index int not null,
  encrypted_text text not null,
  plaintext_text text not null,
  cipher_type text not null,
  cipher_key text not null,
  hint_1 text not null,
  hint_2 text not null,
  hint_3 text not null
);

create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id) on delete set null,
  code text unique not null,
  quest_id text not null references quests(id),
  current_round_id text references rounds(id),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'paused', 'ended')),
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade,
  name text not null
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade,
  nickname text not null,
  team_id uuid references teams(id) on delete set null,
  connection_status text not null default 'online',
  joined_at timestamptz not null default now(),
  unique(session_id, nickname)
);

create table if not exists student_clue_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  clue_id text not null references clues(id),
  round_id text not null references rounds(id),
  submitted_plaintext text,
  is_correct boolean default false,
  hints_used int not null default 0,
  submitted_at timestamptz
);

create table if not exists team_round_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  round_id text not null references rounds(id),
  final_answer text not null,
  is_correct boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists classroom_snapshots (
  id uuid primary key,
  code text unique not null,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table teachers enable row level security;
alter table quests enable row level security;
alter table rounds enable row level security;
alter table clues enable row level security;
alter table class_sessions enable row level security;
alter table teams enable row level security;
alter table students enable row level security;
alter table student_clue_assignments enable row level security;
alter table team_round_submissions enable row level security;
alter table events enable row level security;
alter table classroom_snapshots enable row level security;

create policy "public read quest content" on quests for select using (true);
create policy "public read rounds" on rounds for select using (true);
create policy "public read clues" on clues for select using (true);
create policy "demo read sessions" on class_sessions for select using (true);
create policy "demo create sessions" on class_sessions for insert with check (true);
create policy "demo update sessions" on class_sessions for update using (true);
create policy "demo read teams" on teams for select using (true);
create policy "demo create teams" on teams for insert with check (true);
create policy "demo update teams" on teams for update using (true);
create policy "demo read students" on students for select using (true);
create policy "demo create students" on students for insert with check (true);
create policy "demo update students" on students for update using (true);
create policy "demo read assignments" on student_clue_assignments for select using (true);
create policy "demo write assignments" on student_clue_assignments for all using (true) with check (true);
create policy "demo read team submissions" on team_round_submissions for select using (true);
create policy "demo write team submissions" on team_round_submissions for all using (true) with check (true);
create policy "demo read events" on events for select using (true);
create policy "demo write events" on events for insert with check (true);
create policy "demo read classroom snapshots" on classroom_snapshots for select using (true);
create policy "demo create classroom snapshots" on classroom_snapshots for insert with check (true);
create policy "demo update classroom snapshots" on classroom_snapshots for update using (true);

alter publication supabase_realtime add table class_sessions;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table student_clue_assignments;
alter publication supabase_realtime add table team_round_submissions;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table classroom_snapshots;
