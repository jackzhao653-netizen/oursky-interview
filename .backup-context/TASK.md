# Oursky PM Pre-test — TODO App

## Project overview
Build a simple, working **Todo app** and **deploy it online**. The base app should be intentionally minimal so more time can go into one thoughtful **custom feature** that solves a real problem in how you organize daily work.

This repo is the starting scaffold + extracted requirements from the pre-test PDF.

---

## Requirements (from the PDF)

### What to build
- Build a **simple, working todo app** and **deploy it online**.
- Base todo functionality must include:
  - **Add** tasks
  - **Complete** tasks
  - **Delete** tasks
- Add **one custom feature** that solves a real, practical problem in *your* daily workflow.
  - The custom feature is the **most important** part of the exercise.
  - It **does not** need to be complex or fancy; it must be **thoughtful** and explainable.

### Tools/stack constraints
- **No constraints**: “Use whatever you want” (Cursor/Claude/Codex/etc.).

### What to submit
- **Live URL**: deployed on **Vercel** (or similar: Netlify/Cloudflare Pages/etc.), must be working + accessible.
- **GitHub repo**: **public** repository.
  - They will review **commit history** → commit incrementally (not one big final commit).
- **Short writeup** (max ~half page) covering:
  - What feature you added
  - What problem it solves in your daily workflow (specific: when/how you’d use it)
  - One thing you’d improve/add with more time
- Reply via email with the above.

### Time expectation
- ~**2 hours**.
- Don’t overthink base todo; get it working, then invest in the feature + writeup.

### Evaluation criteria
- **Does it work?** App loads; basic flows + custom feature are functional.
- **Product thinking:** feature solves a real problem; you can justify why it matters.
- **Working process:** multiple commits with clear messages.
- **Clear communication:** concise, specific writeup; not a product pitch.

---

## Technical specification (recommended)
These are *implementation choices* (not required by the PDF) to optimize for speed and clarity:

- **Frontend:** React + TypeScript (Vite)
- **Styling:** minimal CSS / Tailwind (optional)
- **Storage:** local-first (LocalStorage/IndexedDB) to keep scope small
- **Testing:** small unit tests for core reducers/helpers (optional)
- **Deploy:** Vercel

---

## Deliverables checklist
- [ ] Todo app supports add/complete/delete
- [ ] One thoughtful custom feature shipped and usable
- [ ] Deployed live URL (Vercel or similar)
- [ ] Public GitHub repo with incremental commits
- [ ] Short writeup (≤ 1/2 page)

---

## Suggested timeline / milestones (2 hours)
1. **(0:00–0:20)** Scaffold app + basic UI
2. **(0:20–0:50)** Implement add/complete/delete + persistence
3. **(0:50–1:30)** Implement custom feature (core of submission)
4. **(1:30–1:50)** Polish edge cases + quick smoke test
5. **(1:50–2:00)** Writeup + deploy

---

## Custom Feature Ideas (10)
Pick **one** to implement; these are options designed to show product thinking.

1. **Daily Top-3 + Auto-Rollover**
   - **Description:** Each day, you can mark up to 3 tasks as “Today’s Top 3”. At end of day, unfinished Top-3 tasks automatically roll over to tomorrow’s Top-3 suggestions.
   - **Value:** Reflects real behavior: you plan a day, but carryover happens. Keeps focus and reduces guilt from huge lists.
   - **Complexity:** Medium

2. **Context Switch Minimizer (Batch by Context)**
   - **Description:** Allow tasks to have a “context” (e.g., Deep Work, Admin, Errands, Calls). Provide a “Do one context now” view that hides other contexts.
   - **Value:** Helps avoid costly context switching; aligns with how people actually get work done.
   - **Complexity:** Medium

3. **Estimate + Reality Check (Time Budget Bar)**
   - **Description:** Add quick time estimates (5/15/30/60m). Show a daily time budget bar and warn when today’s planned tasks exceed available time.
   - **Value:** Prevents overcommitting; turns the list into a realistic plan.
   - **Complexity:** Medium

4. **Two-Phase Inbox → Plan Workflow**
   - **Description:** Separate “Inbox” capture from “Planned” tasks. A single button “Plan my day” moves selected inbox items into today.
   - **Value:** Mirrors common GTD workflow; reduces clutter and decision fatigue.
   - **Complexity:** Low

5. **Recurring Tasks with “Skip” + Streak-Safe Logic**
   - **Description:** Recurring tasks (daily/weekly). If you miss a day, the next instance appears without generating a huge backlog. Add “Skip” reason.
   - **Value:** Recurring habits are common; backlog explosions are demotivating.
   - **Complexity:** High

6. **End-of-Day Review Prompt + Notes**
   - **Description:** At a chosen time, show a review modal: “What did you finish?”, “What moved?”, “Any blockers?”. Store a short daily note.
   - **Value:** Builds reflection habit; great PM practice (blockers + carryover).
   - **Complexity:** Medium

7. **“Next Action” Enforcer for Big Tasks**
   - **Description:** If a task is marked as “big”, require a next-action subtask before it can be placed into Today.
   - **Value:** Prevents vague tasks (“work on project”) and forces actionable planning.
   - **Complexity:** Medium

8. **Quick Capture with Natural Language Parsing**
   - **Description:** Type: “Send invoice tomorrow 5pm #admin” → auto extracts due date/time + tag.
   - **Value:** Faster capture; reduces friction (key for real usage).
   - **Complexity:** High

9. **Focus Timer + Task Logging (Lightweight Pomodoro)**
   - **Description:** Start a 25-min timer on a task; log sessions per task. Show “effort spent” next to tasks.
   - **Value:** Helps estimate future work and builds momentum.
   - **Complexity:** High

10. **Dependency / Blocker Flag + “Unblock Me” View**
   - **Description:** Mark tasks as blocked with a reason and an “unblock action”. Provide a view that lists only unblock actions.
   - **Value:** PM-realistic: progress often depends on unblocking; makes the list more actionable.
   - **Complexity:** Medium
