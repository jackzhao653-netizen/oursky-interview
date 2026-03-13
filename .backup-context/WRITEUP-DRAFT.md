# Writeup Draft

I built a simple todo app with the required add, complete, and delete flows, and added one custom feature: **Daily Top-3 + Auto-Rollover**.

The problem I wanted to solve is that a long todo list does not actually help me decide what matters today. In my own workflow, I often capture many tasks, but only a few are truly important for the day. If everything stays in one flat list, it becomes easy to feel busy without being focused.

To address that, I added a way to mark up to **three tasks as today’s priorities**. This creates a lightweight daily planning layer on top of a basic todo list. I chose a limit of three because it forces prioritization without adding too much process.

I also added **rollover suggestions** for unfinished priorities. If I marked something as important today but did not finish it, the app can surface it again the next day as a suggested carryover instead of making me manually rebuild my plan. That reflects how I actually organize work: priorities often continue across days, but I still want to consciously decide whether they belong in today’s focus.

I picked this feature because it felt practical and appropriately scoped for the exercise. It is not technically complex, but it adds a clear product opinion: a todo list should help users focus, not just collect tasks.

If I had more time, I would improve the feature by adding a lightweight **history/review view** so users could see their recent Top-3 selections and how often priorities were carried over. That would make the app more reflective without turning it into a heavy planning system.
