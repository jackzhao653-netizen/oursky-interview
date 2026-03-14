# WRITEUP

## What Features Were Added

- PostgreSQL-backed todo persistence using Neon and the `pg` driver
- Serverless REST API endpoints for todo CRUD:
  - `GET /api/todos`
  - `POST /api/todos`
  - `GET /api/todos/[id]`
  - `PUT /api/todos/[id]`
  - `DELETE /api/todos/[id]`
- Automatic database schema bootstrap for todo records, including checklist JSON, Top-3 date, ordering, timestamps, and recurrence fields
- Client-side sync layer that prefers database calls and keeps `localStorage` as an offline fallback
- Queued offline mutations so edits made without connectivity are stored locally and retried when the browser comes back online
- Graceful persistence notices when the app falls back to local cache or restores sync
- Vercel deployment scaffolding with `vercel.json` and `.env.example`
- Repeatable smoke-test script for seeding and verifying sample tasks against a deployed app

## What Problems They Solve In Daily Workflow

- Work is no longer trapped in one browser on one machine.
  A planner used during a morning standup on a laptop can be opened later on another machine without losing the day’s task list.
- Accidental tab closes or browser storage clears are no longer catastrophic.
  Important items such as a red-priority client follow-up or a weekly ops review survive beyond a single browser profile.
- The app still works when the network is unstable.
  If someone updates checklist items on a train or in a meeting room with poor Wi-Fi, those edits stay in local storage and are retried later instead of disappearing.
- CRUD through the API makes the app deployable as a real shared tool instead of a local-only prototype.
  That matters when today’s Top-3 includes client work, product work, and personal admin spread across devices.
- Explicit recurrence fields in the database make recurring routines durable.
  Weekly client check-ins and monthly studio reviews remain structured records instead of ad hoc copies.

## How I Would Actually Use It

- At 9:00 AM, I would pin three tasks for the day: a red Product build task, a yellow Client follow-up, and a green Studio planning task. Those become the focus bar for the day instead of scanning a long backlog.
- During meetings, I would update notes and checklist items directly on the task from my phone or another laptop. If connectivity drops, the app would keep the edits locally and sync them once the connection returns.
- For recurring responsibilities, I would keep one weekly client check-in task and one monthly studio ops task in the system rather than recreating them manually every week or month.
- For time-blocking, I would use the `start`, `end`, and `location` fields to treat the planner as both a todo list and a lightweight schedule for the week.
- For end-of-day cleanup, I would mark completed work done, leave unfinished work open, and reuse Top-3 the next morning without rebuilding context from scratch.

## One Thing I Would Improve With More Time

I would add a proper synchronization status center with conflict resolution. Right now the offline fallback is reliable for a single user on one browser at a time, but if the same task is edited in two places before sync completes, the latest write wins. A stronger version would show pending changes, last sync time, and a merge UI for conflicting edits.
