import { deleteTodo, listTodos, upsertTodo } from "../api/_lib/todos.js"
import { getOccurrenceDatesInRange } from "../src/utils/date.ts"

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

const today = getDateKey(0)
const tomorrow = getDateKey(1)
const nextWeek = getDateKey(7)

const samples = [
  {
    id: "sample-product-sprint-review",
    title: "Product sprint review",
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
      { id: "sample-product-sprint-review-1", text: "Pull roadmap notes", done: true },
      { id: "sample-product-sprint-review-2", text: "Confirm blockers", done: false },
    ],
    order: Date.now(),
    top3Date: today,
  },
  {
    id: "sample-client-weekly-check-in",
    title: "Client weekly check-in",
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
    id: "sample-studio-monthly-ops",
    title: "Studio monthly ops",
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
    checklist: [{ id: "sample-studio-monthly-ops-1", text: "Prep numbers", done: false }],
    order: Date.now() + 2,
    top3Date: today,
  },
  {
    id: "sample-personal-admin-run",
    title: "Personal admin run",
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
    id: "sample-product-prototype-build",
    title: "Product prototype build",
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
    checklist: [{ id: "sample-product-prototype-build-1", text: "Book room", done: true }],
    order: Date.now() + 4,
    top3Date: null,
  },
  {
    id: "sample-client-follow-up-deck",
    title: "Client follow-up deck",
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
    id: "sample-studio-documentation-cleanup",
    title: "Studio documentation cleanup",
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
    id: "sample-delete-me-task",
    title: "Delete-me task",
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
  await upsertTodo(sample, sample.id)
}

let allTodos = await listTodos()
let sampleTodos = allTodos.filter((event) => event.id.startsWith("sample-"))

assert(sampleTodos.length === samples.length, "Expected all sample todos to be created")
assert(new Set(sampleTodos.map((event) => event.category)).size === 4, "Expected four categories in sample data")
assert(new Set(sampleTodos.map((event) => event.priority)).size === 4, "Expected four priorities in sample data")
assert(sampleTodos.some((event) => event.checklist.length > 0), "Expected at least one checklist sample")
assert(sampleTodos.filter((event) => event.top3Date === today).length === 3, "Expected exactly three Top-3 tasks")

const weeklySample = sampleTodos.find((event) => event.id === "sample-client-weekly-check-in")
const monthlySample = sampleTodos.find((event) => event.id === "sample-studio-monthly-ops")

assert(
  weeklySample && getOccurrenceDatesInRange(weeklySample.date, weeklySample.recurrence, today, getDateKey(21)).length >= 3,
  "Weekly recurrence did not produce enough occurrences",
)
assert(
  monthlySample && getOccurrenceDatesInRange(monthlySample.date, monthlySample.recurrence, today, getDateKey(40)).length >= 2,
  "Monthly recurrence did not produce enough occurrences",
)

const updatedTodo = {
  ...sampleTodos.find((event) => event.id === "sample-client-weekly-check-in"),
  notes: "Recurring stakeholder sync. Updated during database smoke test.",
  status: "done",
  updatedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
}

await upsertTodo(updatedTodo, updatedTodo.id)
await deleteTodo("sample-delete-me-task")

allTodos = await listTodos()
sampleTodos = allTodos.filter((event) => event.id.startsWith("sample-"))

assert(sampleTodos.length === samples.length - 1, "Expected delete check to remove one sample todo")
assert(
  sampleTodos.find((event) => event.id === "sample-client-weekly-check-in")?.status === "done",
  "Expected update check to persist done status",
)
assert(
  sampleTodos.find((event) => event.id === "sample-client-weekly-check-in")?.notes.includes("database smoke test"),
  "Expected update check to persist notes",
)
assert(!sampleTodos.some((event) => event.id === "sample-delete-me-task"), "Delete verification task still exists")

console.log("Database smoke test passed")
console.log(`Retained ${sampleTodos.length} sample todos in Neon`)
