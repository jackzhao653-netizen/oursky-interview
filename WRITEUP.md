# WRITEUP

## What problem does Daily Top-3 solve?

A standard todo list is good at collecting tasks, but weak at helping someone decide what actually matters today. When everything sits in one long list, important work can get buried under low-effort admin tasks. The Daily Top-3 feature solves that by creating a small, intentional planning layer: the user picks the three tasks that deserve attention today.

## How does it work?

The app supports normal todo CRUD first: add tasks, complete them, delete them, and persist everything in localStorage. On top of that, each task can be marked as part of today’s Top 3. The UI shows those priorities in a dedicated section above the full task list.

The app also stores the last date it was opened. If the user comes back on a new day, any unfinished Top-3 tasks from the previous day are removed from yesterday’s priority state and shown as rollover suggestions. The user can then add them back into today’s Top 3 with one click, while still respecting the three-task limit.

## Why this approach?

I chose this feature because it is simple to understand, genuinely useful, and realistic for a small MVP. It adds a meaningful layer of product thinking without overcomplicating the codebase. The implementation stays lightweight: React state for UI logic, TypeScript for structure, Tailwind for fast polish, and localStorage for persistence.

## What would I improve with more time?

With more time, I would add drag-and-drop reordering, inline editing, lightweight animations for list transitions, and a clearer date/history view for rollover behavior. I would also add automated tests around the day-change and Top-3 limit logic, since that is the most product-specific part of the app.
