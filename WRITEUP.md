# WRITEUP

## What Feature I Added

Recurring tasks with color-coded priorities.

The feature lets you set tasks to repeat (weekly/monthly/once) and assign them colors (red/yellow/green/white) based on importance. You can also set when they stop—after X times, or on a specific date, or never.

## What Problem It Solves In My Daily Workflow

I'm a mechanical engineering student juggling coursework, my final year project, and job hunting. Every Monday I have a lab report due. Every Friday there's a team meeting. Once a month I need to submit project updates. Before this, I was manually re-creating these tasks every week, which was annoying and I'd sometimes forget.

Now I set "Lab Report" to repeat every Monday (yellow, because it's important but not urgent), and it just shows up automatically. Same with "Team Meeting" every Friday (green, routine). When I open the app on Monday morning, I immediately see what's yellow and know that's what I need to focus on today.

The specific moment this helps: Sunday night when I'm planning my week. I can see all my recurring stuff is already there with the right colors, so I just need to add the one-off tasks. Saves me probably 10 minutes of setup time and mental energy every week.

## One Thing I Would Improve With More Time

I'd add a streak counter for recurring tasks. Like "you've completed this weekly task 7 times in a row." It's a small thing but I think it would make me more motivated to not break the streak, especially for things like "review job postings" that I tend to skip.

---

## Additional Features Implemented

Beyond the core Daily Top-3 feature, the app includes:

- **Calendar-first interface:** Day/week views with mini calendar for date navigation
- **Color-coded priorities:** Red (Urgent), Yellow (Important), Green (Normal), White (Low)
- **Recurrence system:** Once/Weekly/Monthly with smart date handling (e.g., 31st → last day of month)
- **PostgreSQL database:** Neon-hosted with offline-first architecture and automatic sync
- **Settings:** Customizable default view, theme, completed task visibility, and date display format
- **Responsive design:** Works on desktop and mobile with touch-friendly interactions
