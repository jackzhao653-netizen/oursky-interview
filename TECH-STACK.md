# Tech Stack Recommendation

## Recommended stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State management:** React local state (`useState`, `useMemo`, small helper functions)
- **Persistence:** `localStorage`
- **Deployment:** Vercel

---

## 1. Framework choice

### Recommendation: React + TypeScript + Vite

This is the best fit for a 2-hour take-home.

#### Why this is the right choice
- **Fastest route to working software**: Vite gives instant setup, minimal boilerplate, and quick iteration.
- **Low cognitive overhead**: for a single-page todo app, Next.js is unnecessary unless SSR or routing matters, which it does not here.
- **Professional but pragmatic**: React + TypeScript is a credible mainstream stack that signals good engineering judgment without overcomplicating the submission.
- **Easy deployment**: Vercel handles Vite apps smoothly.

#### Why not Next.js
Next.js is excellent, but here it likely adds more ceremony than value:
- file-based routing is not needed,
- server rendering is not needed,
- app router structure is extra overhead for a tiny app.

Using Next.js for this test could look slightly heavier than necessary unless the candidate is already extremely fast with it.

#### Why not Vue or Svelte
Both are good frameworks, but unless they are the candidate's fastest tool, using them introduces avoidable risk. The test is not about framework novelty. It is about product thinking and shipping discipline.

### Verdict
**React + TypeScript + Vite** shows mature scope control: use the simplest solid tool that gets the job done well.

---

## 2. Styling choice

### Recommendation: Tailwind CSS

#### Why Tailwind fits
- **Very fast for small polished UIs**
- Easy to create clean spacing, typography, states, and layout without context-switching between files
- Helps produce a modern-looking result quickly
- Good for lightweight components like cards, task rows, banners, pills, and action buttons

#### Why not CSS Modules
CSS Modules are perfectly fine, but for a short take-home they may slow down visual iteration. They also provide less velocity for quickly tweaking layout and states.

#### Why not styled-components
Too much overhead for this scope. Runtime styling is unnecessary here and may signal solving the wrong problem.

### Verdict
**Tailwind** is the best choice if already familiar. If not already comfortable, plain CSS is safer than learning Tailwind during the test.

---

## 3. State management choice

### Recommendation: local React state only

Use:
- `useState` for tasks and UI state
- `useEffect` for persistence to localStorage
- helper functions for task operations and rollover logic

#### Why this is the right choice
- The data model is tiny.
- Global state libraries are unnecessary.
- Fewer abstractions means easier debugging and faster delivery.
- It shows good judgment: don’t add Redux/Zustand when simple component state is enough.

### Suggested data shape
```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  top3Date?: string | null;
};
```

Additional persisted metadata:
```ts
type AppState = {
  tasks: Task[];
  lastOpenedDate: string;
};
```

This is enough to support base CRUD, Top-3 selection, and rollover suggestions.

---

## 4. Persistence choice

### Recommendation: localStorage

#### Why
- Zero backend needed
- Fully sufficient for a personal productivity demo
- Faster implementation and deployment
- More reliable under a hard time limit than adding APIs or databases

This is a good example of matching architecture to scope.

---

## 5. Deployment choice

### Recommendation: Vercel

#### Why Vercel is best
- Directly aligned with the PDF recommendation
- Very fast deploy flow
- Stable preview/production hosting
- Good signal that the candidate can finish and ship cleanly

#### Why not Netlify or Cloudflare Pages
Both are valid, but Vercel is explicitly suggested in the prompt. Following that suggestion is sensible unless there is a strong reason not to.

### Verdict
**Deploy to Vercel** unless something unexpectedly fails, in which case Netlify is the fallback.

---

## What this stack signals to Oursky

This stack says:
- I understand the assignment is about **judgment**, not stack flexing.
- I can choose tools that maximize delivery speed.
- I know when **not** to introduce unnecessary complexity.
- I can ship a clean, modern, working product quickly.

That is probably a better signal than choosing a more elaborate architecture.

---

## Final recommendation summary

### Use this
- **React + TypeScript + Vite**
- **Tailwind CSS**
- **React local state + helper functions**
- **localStorage**
- **Vercel**

### Why
Because it is the best combination of:
- **speed of development**
- **low implementation risk**
- **clean engineering judgment**
- **strong fit for the assignment**
