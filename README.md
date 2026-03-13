# Daily Top-3 Todo App

A minimalist todo app with intelligent daily prioritization.

## Features
- ✅ Add, complete, and delete tasks
- ⭐ Mark up to 3 tasks as daily priorities
- 🔄 Auto-rollover unfinished priorities to the next day
- 💾 Persistent storage with localStorage
- 📱 Fully responsive, mobile-first interface
- ⌨️ Keyboard-friendly input flow (Enter to add, Escape to clear)

## Custom Feature: Daily Top-3 + Auto-Rollover

A long task list tells you *everything* you could do, but not what matters most today. This app adds a lightweight planning layer on top of a normal todo list:

- Choose up to three tasks as **Today’s Top 3**
- Keep those priorities visually separate from the rest of the backlog
- When a new day starts, unfinished priorities become **rollover suggestions**
- Restore them into today’s Top 3 with one click if they still deserve attention

The result is a simple workflow that encourages daily focus without requiring a complex productivity system.

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- localStorage

## Setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run lint
```

## Live Demo
Vercel deployment was attempted during this build session, but no production URL is available in the repo yet. Run `npx vercel --prod` in the project directory to publish once Vercel auth/project setup is available.
