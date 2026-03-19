# Todo

A calendar-first todo planner with intelligent daily prioritization.

## Live Demo
**https://oursky-interview.vercel.app** (current deployment URL; Vercel project/domain still use the old slug)

## Features

### Core Functionality
- ✅ Add, complete, and delete tasks
- 📅 Calendar-first interface (day/week views with mini calendar)
- 🎨 Color-coded priorities (Red/Yellow/Green/White)
- 🔄 Recurrence system (Once/Weekly/Monthly with smart date handling)
- 💾 PostgreSQL database with offline-first architecture
- ⚙️ Settings for customization (default view, theme, completed task visibility)

### Custom Feature: Daily Top-3 Priority System

The app includes a **Daily Top-3** section that sits at the top of the calendar view. It automatically rolls over incomplete tasks from the previous day and limits you to three priority items per day.

**Problem it solves:**

Long task lists create decision paralysis. This feature forces you to commit to three specific outcomes before the day starts. When you open the app in the morning, yesterday's incomplete items are already there, demanding a decision: keep them as priorities or demote them. This creates accountability and prevents tasks from drifting indefinitely.

**Use cases:**
- Morning planning (around 8 AM): Review rolled-over items and set today's priorities
- End-of-day review (around 10 PM): Complete remaining items or acknowledge what needs to roll over

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Database:** PostgreSQL (Neon) with offline-first sync
- **Deployment:** Vercel
- **State Management:** React hooks + LocalStorage fallback

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://...
```

For Vercel deployment, add `DATABASE_URL` via:
```bash
vercel env add DATABASE_URL
```

## Build

```bash
npm run build
npm run lint
```

## Database

The app uses PostgreSQL with an offline-first architecture:
- LocalStorage for immediate persistence
- Background sync to PostgreSQL when online
- Automatic conflict resolution

API endpoints are in `/api` (Vercel serverless functions).

## Development Notes

- Dev server runs on `localhost:5173`
- Database sync only works in production (Vercel)
- LocalStorage fallback for local development

## License

MIT
