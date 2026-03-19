const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "").replace(
  /\/$/,
  "",
)

if (!baseUrl) {
  throw new Error("Provide a deployment URL: node scripts/smoke-test.mjs https://your-app.vercel.app")
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function getDateKey(offsetDays = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status} ${JSON.stringify(payload)}`)
  }

  return payload
}

const today = getDateKey(0)
const tomorrow = getDateKey(1)
const nextWeek = getDateKey(7)
const runId = `smoke-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}`

const samples = [
  {
    id: `${runId}-1`,
    title: `[${runId}] Product sprint review`,
    category: "Product",
    activity: "review",
    priority: "red",
    recurrence: "once",
    date: today,
    start: "09:00",
    end: "10:00",
    location: "HQ boardroom",
    notes: "Validate priorities for the current sprint.",
    status: "open",
    checklist: [
      { id: `${runId}-1-a`, text: "Pull roadmap notes", done: true },
      { id: `${runId}-1-b`, text: "Confirm blockers", done: false },
    ],
    order: Date.now(),
    top3Date: today,
  },
  {
    id: `${runId}-2`,
    title: `[${runId}] Client weekly check-in`,
    category: "Client",
    activity: "follow-up",
    priority: "yellow",
    recurrence: "weekly",
    date: today,
    start: "11:00",
    end: "11:30",
    location: "Zoom",
    notes: "Recurring stakeholder sync.",
    status: "open",
    checklist: [],
    order: Date.now() + 1,
    top3Date: today,
  },
  {
    id: `${runId}-3`,
    title: `[${runId}] Studio monthly ops`,
    category: "Studio",
    activity: "planning",
    priority: "green",
    recurrence: "monthly",
    date: tomorrow,
    start: "",
    end: "",
    location: "",
    notes: "Review budgets and staffing.",
    status: "open",
    checklist: [{ id: `${runId}-3-a`, text: "Prep numbers", done: false }],
    order: Date.now() + 2,
    top3Date: today,
  },
  {
    id: `${runId}-4`,
    title: `[${runId}] Personal admin run`,
    category: "Personal",
    activity: "errand",
    priority: "white",
    recurrence: "once",
    date: tomorrow,
    start: "17:30",
    end: "18:30",
    location: "Central",
    notes: "Pick up documents after work.",
    status: "open",
    checklist: [],
    order: Date.now() + 3,
    top3Date: null,
  },
  {
    id: `${runId}-5`,
    title: `[${runId}] Product prototype build`,
    category: "Product",
    activity: "build",
    priority: "red",
    recurrence: "once",
    date: nextWeek,
    start: "14:00",
    end: "16:30",
    location: "Maker space",
    notes: "Hands-on prototype session.",
    status: "open",
    checklist: [{ id: `${runId}-5-a`, text: "Book room", done: true }],
    order: Date.now() + 4,
    top3Date: null,
  },
  {
    id: `${runId}-6`,
    title: `[${runId}] Client follow-up deck`,
    category: "Client",
    activity: "build",
    priority: "yellow",
    recurrence: "once",
    date: nextWeek,
    start: "",
    end: "",
    location: "",
    notes: "Prepare revised proposal deck.",
    status: "open",
    checklist: [],
    order: Date.now() + 5,
    top3Date: null,
  },
  {
    id: `${runId}-7`,
    title: `[${runId}] Studio documentation cleanup`,
    category: "Studio",
    activity: "review",
    priority: "green",
    recurrence: "once",
    date: today,
    start: "",
    end: "",
    location: "",
    notes: "Archive last quarter handoff notes.",
    status: "open",
    checklist: [],
    order: Date.now() + 6,
    top3Date: null,
  },
  {
    id: `${runId}-delete`,
    title: `[${runId}] Delete-me task`,
    category: "Personal",
    activity: "planning",
    priority: "white",
    recurrence: "once",
    date: today,
    start: "",
    end: "",
    location: "",
    notes: "Temporary task for delete verification.",
    status: "open",
    checklist: [],
    order: Date.now() + 7,
    top3Date: null,
  },
]

for (const sample of samples) {
  await request("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sample),
  })
}

let allTodos = await request("/api/todos")
let smokeTodos = allTodos.events.filter((event) => event.id.startsWith(runId))

assert(smokeTodos.length === samples.length, "Expected all smoke-test todos to be created")
assert(new Set(smokeTodos.map((event) => event.category)).size === 4, "Expected all categories to exist")
assert(new Set(smokeTodos.map((event) => event.priority)).size === 4, "Expected all priority levels to exist")
assert(smokeTodos.some((event) => event.recurrence === "weekly"), "Missing weekly recurrence sample")
assert(smokeTodos.some((event) => event.recurrence === "monthly"), "Missing monthly recurrence sample")
assert(smokeTodos.some((event) => Array.isArray(event.checklist) && event.checklist.length > 0), "Missing checklist sample")
assert(smokeTodos.filter((event) => event.top3Date === today).length === 3, "Expected exactly three Top-3 tasks")

const updatedTodo = {
  ...smokeTodos.find((event) => event.id === `${runId}-2`),
  notes: "Recurring stakeholder sync. Updated during smoke test.",
  status: "done",
  updatedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
}

await request(`/api/todos/${updatedTodo.id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(updatedTodo),
})

await request(`/api/todos/${runId}-delete`, {
  method: "DELETE",
})

allTodos = await request("/api/todos")
smokeTodos = allTodos.events.filter((event) => event.id.startsWith(runId))

assert(smokeTodos.length === samples.length - 1, "Expected delete operation to remove one smoke-test todo")

const doneTodo = smokeTodos.find((event) => event.id === `${runId}-2`)
assert(doneTodo?.status === "done", "Expected PUT update to persist status change")
assert(doneTodo?.notes.includes("Updated during smoke test"), "Expected PUT update to persist note change")
assert(!smokeTodos.some((event) => event.id === `${runId}-delete`), "Deleted todo still present")

const homepage = await fetch(baseUrl)
const homepageHtml = await homepage.text()
assert(homepage.ok, "Homepage request failed")
assert(homepageHtml.includes("Todo"), "Homepage content did not load correctly")

console.log(`Smoke test passed against ${baseUrl}`)
console.log(`Created ${smokeTodos.length} retained sample todos with run id ${runId}`)
