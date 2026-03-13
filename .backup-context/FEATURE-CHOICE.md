# Feature Choice: Daily Top-3 + Auto-Rollover

## Chosen feature
**Daily Top-3 + Auto-Rollover**

Users can mark up to **3 tasks** as their focus for today. When the day changes, any unfinished Top-3 tasks are surfaced as **rollover suggestions** for the new day instead of being silently lost in the full list.

---

## Why this is the best choice

Out of the 10 options, this is the strongest fit for the exercise because it hits the best balance of **real user value**, **implementation scope**, and **product judgment**.

### 1. It solves a real daily-work organization problem
The core problem is not "storing todos." Most todo apps can already do that. The real problem is:
- people over-plan,
- lose focus once the list gets long,
- and start each day with no clear priority reset.

A **Top-3** mechanism addresses that directly. It turns a generic task list into a lightweight daily planning tool.

The **auto-rollover** part matters because it reflects reality: unfinished priorities often remain important tomorrow. Instead of forcing users to rebuild their daily plan from scratch, the app helps them resume with minimal friction.

That is a strong product story: **focus + continuity**.

### 2. It shows product thinking, not just feature stuffing
This feature is thoughtful because it introduces a clear opinion about work:
- you should not try to do everything today,
- daily planning should be constrained,
- and the system should respect carryover rather than punish it.

That is a much better signal for a PM-oriented take-home than adding something flashy but generic.

It also creates a natural explanation in the writeup:
> "I often write too many tasks, but only a few truly matter each day. The Top-3 view helps me commit to realistic priorities, and rollover suggestions make the next day easier to plan."

That is specific, believable, and easy for reviewers to understand.

### 3. It is implementable within ~45 minutes
This feature is safely buildable in the time box.

It only needs:
- a `topPriorityDate` or `isTop3ForDate` data model,
- a 3-task selection limit,
- a dedicated "Today’s Top 3" section,
- day-boundary detection,
- rollover suggestion logic based on unfinished tasks from the previous day.

No backend is required. No complicated parsing, timers, notifications, or recurrence engines are needed.

### 4. It looks polished without being over-engineered
The UI can be simple but still feel intentional:
- a "Mark as Top 3" action on each task,
- a pinned "Today’s Top 3" panel,
- a small banner like "2 unfinished priorities from yesterday — add back to today?"

This is enough to make the app feel like a designed workflow rather than plain CRUD.

### 5. It is technically safer than several other options
Compared with other ideas:
- **Natural language parsing** is impressive but risky in a short test.
- **Recurring tasks** have too many edge cases.
- **Pomodoro logging** takes more UI/time than it returns.
- **Dependency/blocker view** is PM-relevant, but needs more explanation and more task metadata.
- **Inbox → Plan workflow** is safe, but slightly less distinctive.

Top-3 + rollover is the best middle ground: more distinctive than Inbox/Plan, much safer than parsing/timers/recurrence.

---

## Why not the other strongest alternatives

### Alternative 1: Two-Phase Inbox → Plan Workflow
This is the safest feature to build, and it is a good runner-up. But it is also more common and less memorable. It shows decent process thinking, though not as much focused prioritization insight as Top-3.

### Alternative 2: Estimate + Reality Check
This is also a strong PM-style feature because it shows awareness of planning capacity. But it needs more UI and calibration to feel right. If done too quickly, it risks looking like arbitrary numbers.

### Alternative 3: Dependency / Blocker Flag + Unblock Me
This has strong PM flavor, but in a 2-hour todo test it may read slightly too process-heavy unless executed very cleanly. It also requires more explanation for why a lightweight personal todo app should center blockers.

---

## What Oursky is likely evaluating
They are probably not looking for complexity. They are likely checking whether the candidate can:
- identify the real user problem,
- pick an appropriately scoped solution,
- make tradeoffs under time pressure,
- and explain those tradeoffs clearly.

This feature supports all of those.

It communicates:
- **restraint** — not overbuilding,
- **product sense** — focus is more valuable than feature count,
- **execution judgment** — feasible inside the deadline,
- **communication clarity** — easy to demo and justify.

---

## Recommended scope for implementation
To keep it sharp and realistic, the feature should include only these elements:

### Must include
- Mark/unmark a task as part of **Today’s Top 3**
- Enforce **maximum 3** selected tasks
- Dedicated **Today’s Top 3** UI section
- Persist state in localStorage
- On a new day, identify unfinished Top-3 tasks from the previous day
- Show them as **rollover suggestions**

### Nice but optional
- One-click action: **"Add all rollover suggestions"**
- Small helper text explaining the feature
- Soft empty state like: "Choose up to 3 priorities for today"

### Avoid in this test
- Multi-day calendar views
- Complex history analytics
- Automatic task duplication across days
- Notifications or scheduling

---

## Final recommendation
Build **Daily Top-3 + Auto-Rollover**.

It is the best choice because it is:
- **useful in real work**,
- **simple enough to finish well**,
- **distinctive enough to stand out**,
- and **easy to justify in a PM interview context**.
