# WRITEUP

## What Feature I Added

**Daily Top-3 Priority System**

A dedicated section at the top of the calendar view that automatically rolls over incomplete tasks from the previous day and limits you to three priority items per day.

## What Problem It Solves In My Daily Workflow

As a mechanical engineering student juggling coursework, final year project work, and job applications, I constantly face decision paralysis when looking at a long todo list. I waste time each morning deciding what to work on first, and often end the day having made progress on many things but completed nothing significant.

The Daily Top-3 forces me to commit to three specific outcomes before the day starts. When I open the app in the morning, yesterday's incomplete items are already there, demanding a decision: keep them as priorities or demote them. This creates accountability and prevents tasks from drifting indefinitely.

**Specific use cases:**

- **Morning planning (around 8 AM):** Review rolled-over items from yesterday and set today's three priorities. The auto-rollover means I can't ignore yesterday's failures—I have to actively choose to keep or drop each item.

- **End-of-day review (around 10 PM):** Complete remaining priorities or acknowledge what needs to roll over. The three-item limit forces me to be realistic about what's achievable in one day.

- **Mid-day focus:** When I get distracted by new requests or ideas, the Top-3 section serves as a visual anchor reminding me what I committed to completing today.

## One Thing I Would Improve With More Time

I would add a **completion streak indicator** that shows how many consecutive days I've completed all three priorities. This would add a gamification element that leverages loss aversion—once you have a 7-day streak, you don't want to break it. It would provide positive reinforcement for the behavior the feature is trying to encourage.

The streak would reset when you fail to complete all three items, creating a clear feedback loop that makes the cost of overcommitting or procrastinating immediately visible.

---

## Additional Features Implemented

Beyond the core Daily Top-3 feature, the app includes:

- **Calendar-first interface:** Day/week views with mini calendar for date navigation
- **Color-coded priorities:** Red (Urgent), Yellow (Important), Green (Normal), White (Low)
- **Recurrence system:** Once/Weekly/Monthly with smart date handling (e.g., 31st → last day of month)
- **PostgreSQL database:** Neon-hosted with offline-first architecture and automatic sync
- **Settings:** Customizable default view, theme, completed task visibility, and date display format
- **Responsive design:** Works on desktop and mobile with touch-friendly interactions
