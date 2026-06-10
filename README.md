# CipherQuest

CipherQuest is a full-stack EdTech app for a two-lesson introductory cryptography class. Students solve a school cyber-safety mystery by decrypting clues, sharing evidence with teammates, and submitting final case answers.

## What is included

- Next.js, React, TypeScript, and Tailwind CSS
- Individual Mode for solo learners
- Teacher Mode with class-code sessions, teams, progress table, lock/unlock, pause/resume, and round advancement
- Student Join flow without accounts
- Caesar, substitution, and Vigenere cipher tools
- Flexible quest data model with two seeded lesson quests
- Supabase schema, RLS starter policies, realtime publication setup, and seed script
- Unit tests for cipher and answer-checking logic

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

The classroom flow works immediately as a local demo using browser storage if Supabase variables are missing. For real multi-device classroom use, add Supabase variables. The app will then store class sessions in Supabase and broadcast updates across devices.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Copy your project URL and anon key into `.env.local`.
5. Add your service role key only for local seeding:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The schema enables realtime for sessions, students, teams, assignments, submissions, and events. The policies are intentionally permissive for MVP classroom trials. Tighten them before using real student data.

The cloud classroom MVP uses `classroom_snapshots` for live session state. This keeps the teacher dashboard and student screens synchronized across different computers, networks, and locations after deployment.

## Seed quests

After the schema is created:

```bash
npm run seed
```

This inserts:

- Lesson 1: The Suspicious School Notes
- Lesson 2: Eve Gets Smarter: The Locked Wi-Fi Trap

## Test

```bash
npm test
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.
5. Run `npm run seed` locally or through a secure one-off environment with the service role key.

After deployment, share the Vercel URL with students. Teacher and student devices must use the deployed URL, not `localhost`.

## How to use the app

Teacher Mode:

- Go to `/teacher/session/create`.
- Choose a quest.
- Share the generated class code.
- Start, pause, lock, unlock, reset, and advance the session from the dashboard.

Student Join:

- Go to `/join`.
- Enter the class code and a nickname.
- Decrypt the assigned clue, submit it, view team clues, and submit a final answer.

Individual Mode:

- Go to `/individual`.
- Choose Lesson 1 or Lesson 2.
- Work through each clue with the built-in cipher side panel.

## Production notes

The app is structured so `lib/classroom-store.ts` can be replaced with Supabase-backed calls and realtime subscriptions without changing the page contracts. For production, move session creation, nickname checks, clue assignment, progress updates, and teacher actions to Supabase RPC functions or route handlers so validation is enforced on the server.
