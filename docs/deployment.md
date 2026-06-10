# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable email auth for teachers when you are ready to move beyond the demo teacher account.
4. Keep the anon key public. Keep the service role key private and use it only for seeding.
5. Run `npm run seed` after setting the variables in `.env.local`.

## Realtime tables

The schema adds these tables to `supabase_realtime`:

- `class_sessions`
- `students`
- `teams`
- `student_clue_assignments`
- `team_round_submissions`
- `events`
- `classroom_snapshots`

The cloud MVP stores live class state in `classroom_snapshots`. Teacher and student screens subscribe to that row, so class codes, teams, lock state, clue submissions, and final answers sync across devices.

## Vercel

1. Import the GitHub repository.
2. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Do not set `SUPABASE_SERVICE_ROLE_KEY` in the public frontend unless you need a protected server-only seed operation.
4. Deploy.

Use the deployed Vercel URL for the actual class. `localhost` only works on the computer running the development server.

## Classroom hardening checklist

- Replace permissive MVP RLS policies with teacher/session-scoped policies.
- Move snapshot/session mutations into route handlers or Supabase RPC functions.
- Add teacher auth with Supabase Auth.
- Add rate limits for student join attempts.
- Avoid storing sensitive student data. Nicknames are enough for the intended classroom activity.
