# Development Plan

## Goal
Build a minimal but polished todo app that clearly satisfies the required CRUD flows, then spend most of the time on a thoughtful custom feature: **Daily Top-3 + Auto-Rollover**.

The main evaluation target is not complexity. It is whether the app works, whether the custom feature solves a believable daily-work problem, and whether the work process looks disciplined.

---

## Overall 2-hour timeline

- **Phase 0: Setup** — 15 min
- **Phase 1: Base Todo App** — 30 min
- **Phase 2: Custom Feature** — 45 min
- **Phase 3: Polish + Deploy** — 20 min
- **Phase 4: Documentation** — 10 min

Total: **120 min**

---

# Phase 0: Setup (15 min)

## Objective
Get to a clean, runnable project as fast as possible with the right structure for the feature.

## Tech decisions
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** local React state
- **Persistence:** localStorage
- **Deployment:** Vercel

## Tasks

### 0.1 Initialize project (5 min)
- Create Vite React + TypeScript app
- Install dependencies
- Add Tailwind
- Run local dev server

### 0.2 Create base structure (5 min)
Recommended structure:
```\nsrc/
  components/
    TodoInput.tsx
    TodoList.tsx
    TodoItem.tsx
    TopThreePanel.tsx
    RolloverBanner.tsx
  lib/
    storage.ts
    dates.ts
    tasks.ts
  types/
    task.ts
  App.tsx
```

### 0.3 Define data model and helpers (5 min)
Set up:
- `Task` type
- storage load/save helpers
- date helper for `YYYY-MM-DD`
- task operation helpers if useful

## Git checkpoint
**Commit:** `chore: initialize vite todo app`

---

# Phase 1: Base Todo App (30 min)

## Objective
Finish the non-negotiable requirements quickly and reliably.

## Functional scope
- Add task
- Complete task
- Delete task
- Persist tasks in localStorage
- Clean responsive layout

## Tasks

### 1.1 Add task creation flow (10 min)
- Input field + add button
- Enter key submits
- Prevent empty submissions
- New tasks appended to list

### 1.2 Implement complete/delete actions (10 min)
- Checkbox or toggle for completion
- Delete button per item
- Completed tasks visually distinguished

### 1.3 Persistence + layout cleanup (10 min)
- Save tasks to localStorage on change
- Load tasks on first render
- Add basic spacing, card layout, mobile-friendly width
- Add empty state when no tasks exist

## UI principles
- Keep it simple and readable
- Avoid decorative complexity
- Make primary actions obvious
- Ensure mobile layout still works

## Git checkpoint
**Commit:** `feat: basic todo CRUD`

---

# Phase 2: Custom Feature Implementation (45 min)

## Chosen feature
**Daily Top-3 + Auto-Rollover**

## Problem it solves
A long task list does not help decide what matters today. Users need a lightweight way to commit to a few priorities and recover unfinished priorities the next day without manual re-planning.

## Feature scope
### Must-have behavior
- User can mark up to **3 tasks** as today’s priorities
- App shows a **Today’s Top 3** section
- User cannot exceed 3 selected tasks
- On a new day, unfinished Top-3 tasks from yesterday appear as **rollover suggestions**
- Suggestions can be added back into today’s Top 3

### Keep out of scope
- Multi-day planning
- Calendar views
- Notifications
- Productivity analytics
- Automatic duplication/history tracking beyond simple rollover suggestions

## Technical approach

### Data model
```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  top3Date?: string | null;
};
```

### Supporting app metadata
```ts
type PersistedState = {
  tasks: Task[];
  lastOpenedDate: string;
};
```

### Core logic
- `today = getTodayKey()`
- `top3Today = tasks.filter(task => task.top3Date === today)`
- when app loads:
  - compare `lastOpenedDate` vs `today`
  - if changed, find unfinished tasks where `top3Date === lastOpenedDate`
  - expose those as rollover suggestions
  - update persisted `lastOpenedDate`
- marking a task as Top-3 sets `top3Date = today`
- unmarking clears `top3Date`
- selection blocked if already 3 tasks chosen for today

## Subtasks

### 2.1 Add task metadata + today panel (10 min)
- Extend task type with `top3Date`
- Derive `top3Today`
- Build `TopThreePanel`
- Show empty state: "Choose up to 3 priorities for today"

**Commit:** `feat: add daily top-3 priority section`

### 2.2 Add selection logic + limit enforcement (10 min)
- Add action to mark/unmark task as Top-3
- Enforce max 3 tasks
- Show friendly helper text if limit reached
- Make Top-3 state visually obvious in list and panel

**Commit:** `feat: enforce top-3 daily focus workflow`

### 2.3 Add rollover suggestion logic (10 min)
- Persist `lastOpenedDate`
- Detect date change on load
- Collect unfinished Top-3 tasks from previous day
- Surface them in banner/card UI

### 2.4 Add rollover interactions (10 min)
- Add "Add back to today" action per suggested task
- Add optional "Add all" if quick to implement
- Hide suggestions after action or dismiss

**Commit:** `feat: add rollover suggestions for unfinished priorities`

### 2.5 Quick edge-case pass (5 min)
- Ensure completed Top-3 tasks do not appear as rollover suggestions
- Ensure limit still applies during rollover
- Ensure deleted tasks are removed cleanly
- Ensure refreshing does not duplicate suggestions incorrectly

## UI/UX considerations
- The Top-3 section should sit above the full task list so the feature is visible immediately.
- The task row should have a light, low-friction affordance such as:
  - `Set as Top 3`
  - or a small star/priority button with label.
- Limit feedback should be clear but not annoying.
- Rollover suggestions should feel helpful, not punitive. Wording matters.

### Suggested microcopy
- "Today’s Top 3"
- "Choose up to 3 priorities for today"
- "You already picked 3 priorities"
- "Unfinished priorities from yesterday"
- "Add back to today"

---

# Phase 3: Polish & Deploy (20 min)

## Objective
Make the app feel complete and reduce the chance of last-minute submission issues.

## Tasks

### 3.1 UI refinement (8 min)
- Tighten spacing and hierarchy
- Improve button states and hover/focus styles
- Ensure completed tasks are still readable
- Make Top-3 panel visually distinct

### 3.2 Error handling + guardrails (4 min)
- Ignore blank input
- Prevent over-selection in Top-3
- Graceful empty states
- Handle missing/corrupted localStorage with sane defaults if practical

### 3.3 Production verification (4 min)
- Run build locally
- Fix any TypeScript or lint issues that block deployment
- Smoke test app flows

### 3.4 Deploy to Vercel (4 min)
- Import repo to Vercel
- Deploy production build
- Test live URL
- Verify mobile viewport quickly

## Git checkpoint
**Commit:** `chore: deploy to production`

---

# Phase 4: Documentation (10 min)

## Objective
Explain the feature clearly and show good reflection without overselling.

## Tasks

### 4.1 README update (4 min)
Include:
- what the app does
- custom feature summary
- local setup steps
- live URL

### 4.2 Writeup draft/final (6 min)
Half-page max covering:
- what feature was added
- what real workflow problem it solves
- how it fits personal daily work
- one thing to improve with more time

## Git checkpoint
**Commit:** `docs: add project writeup`

---

# Risk Assessment

## 1. Time management risk
### Risk
Spending too long polishing the base todo app or debating the feature.

### Mitigation
- Freeze scope early
- Ship CRUD first
- Start feature work by minute 45 at the latest
- Defer visual polish until after feature is functional

## 2. Feature creep risk
### Risk
Turning Top-3 into a full planner with dates, history, and analytics.

### Mitigation
- Stick to one-day focus only
- Use simple date keys
- Treat rollover as suggestions, not full recurrence/history

## 3. State complexity risk
### Risk
Rollover behavior becomes messy if state shape is unclear.

### Mitigation
- Keep a tiny data model
- Use one `top3Date` field instead of separate priority entities
- Store only essential metadata

## 4. Deployment risk
### Risk
App works locally but fails on Vercel because build was not tested.

### Mitigation
- Run `npm run build` before deployment
- Keep dependencies minimal
- Avoid environment variables entirely if possible

## 5. Writeup quality risk
### Risk
Writeup sounds generic or too "product pitch" instead of grounded reflection.

### Mitigation
- Use a concrete personal workflow example
- Explain tradeoff honestly
- Mention one realistic next improvement

---

# Success Criteria

## Must-haves
- App is deployed and accessible
- Add / complete / delete all work reliably
- Tasks persist between reloads
- Top-3 feature works
- Rollover suggestions work on day change
- Commit history shows incremental progress
- Writeup is concise and specific

## Should-haves
- Clean responsive UI
- Helpful empty states and validation
- Polished Top-3 panel and rollover banner
- Clear README

## Nice-to-haves
- Add-all rollover action
- Subtle animations/transitions
- Small unit tests for helper logic
- Dismiss rollover suggestions

---

# Commit Strategy

The commit history should show clear iterative thinking rather than one final dump.

## Recommended commit sequence
1. `chore: initialize vite todo app`
2. `feat: basic todo CRUD`
3. `feat: add daily top-3 priority section`
4. `feat: enforce top-3 daily focus workflow`
5. `feat: add rollover suggestions for unfinished priorities`
6. `chore: polish UI and prepare production build`
7. `chore: deploy to production`
8. `docs: add project writeup`

## What this shows reviewers
- You started from a clean scaffold
- You shipped core requirements first
- You built the feature incrementally
- You left time for polish and deployment
- You documented the work clearly

## Practical commit rule
Commit every time one user-visible behavior becomes real and stable. That makes the history readable and believable.

---

# Final advice
If time gets tight, protect these in order:
1. working CRUD
2. visible Top-3 selection
3. rollover suggestions
4. deployment
5. documentation polish

Do not sacrifice functionality for cosmetic refinement. In this test, a simple app with a smart feature beats a prettier app with weak product judgment.
