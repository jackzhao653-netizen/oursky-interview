import { ensureSchema, query } from "./db.js"

const PRIORITY_LEVELS = new Set(["red", "yellow", "green", "white"])
const TODO_STATUSES = new Set(["open", "done", "cancelled"])
const RECURRENCE_OPTIONS = new Set(["once", "weekly", "monthly"])

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function toIsoString(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }

  return null
}

function normalizeChecklistItem(item, index) {
  if (item && typeof item === "object") {
    return {
      id:
        typeof item.id === "string" && item.id.length > 0
          ? item.id
          : createId(),
      text:
        typeof item.text === "string" && item.text.trim().length > 0
          ? item.text.trim()
          : `Checklist item ${index + 1}`,
      done: Boolean(item.done),
    }
  }

  return {
    id: createId(),
    text: `Checklist item ${index + 1}`,
    done: false,
  }
}

function normalizeTodoEvent(input, pathId) {
  const raw = input && typeof input === "object" ? input : {}
  const now = new Date().toISOString()
  const title = typeof raw.title === "string" ? raw.title.trim() : ""

  if (!title) {
    throw new Error("Todo title is required")
  }

  const status =
    typeof raw.status === "string" && TODO_STATUSES.has(raw.status)
      ? raw.status
      : "open"

  const completedAt =
    status === "done"
      ? toIsoString(raw.completedAt) ?? now
      : raw.completedAt === null
        ? null
        : toIsoString(raw.completedAt)

  return {
    id:
      typeof pathId === "string" && pathId.length > 0
        ? pathId
        : typeof raw.id === "string" && raw.id.length > 0
          ? raw.id
          : createId(),
    title,
    category:
      typeof raw.category === "string" && raw.category.trim().length > 0
        ? raw.category.trim()
        : "Product",
    activity:
      typeof raw.activity === "string" && raw.activity.trim().length > 0
        ? raw.activity.trim()
        : "planning",
    priority:
      typeof raw.priority === "string" && PRIORITY_LEVELS.has(raw.priority)
        ? raw.priority
        : "green",
    recurrence:
      typeof raw.recurrence === "string" && RECURRENCE_OPTIONS.has(raw.recurrence)
        ? raw.recurrence
        : "once",
    date: isDateKey(raw.date) ? raw.date : getTodayKey(),
    start: typeof raw.start === "string" ? raw.start : "",
    end: typeof raw.end === "string" ? raw.end : "",
    location: typeof raw.location === "string" ? raw.location : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    status,
    checklist: Array.isArray(raw.checklist)
      ? raw.checklist.map(normalizeChecklistItem)
      : [],
    order:
      typeof raw.order === "number" && Number.isFinite(raw.order)
        ? Math.trunc(raw.order)
        : Date.now(),
    top3Date: isDateKey(raw.top3Date) ? raw.top3Date : null,
    createdAt: toIsoString(raw.createdAt) ?? now,
    updatedAt: toIsoString(raw.updatedAt) ?? now,
    completedAt,
  }
}

function mapTodoRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    activity: row.activity,
    priority: row.priority,
    recurrence: row.recurrence,
    date: row.date,
    start: row.start,
    end: row.end,
    location: row.location,
    notes: row.notes,
    status: row.status,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    order:
      typeof row.order === "number" ? row.order : Number.parseInt(row.order, 10),
    top3Date: row.top3Date,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    completedAt: toIsoString(row.completedAt),
  }
}

const TODO_SELECT = `
  SELECT
    id,
    title,
    category,
    activity,
    priority,
    recurrence,
    date::text AS date,
    "start" AS start,
    "end" AS end,
    location,
    notes,
    status,
    checklist,
    "order" AS "order",
    top3_date::text AS "top3Date",
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    completed_at AS "completedAt"
  FROM todos
`

export async function listTodos() {
  await ensureSchema()
  const result = await query(`
    ${TODO_SELECT}
    ORDER BY date ASC, "order" ASC, created_at ASC
  `)

  return result.rows.map(mapTodoRow)
}

export async function getTodoById(id) {
  await ensureSchema()
  const result = await query(
    `
      ${TODO_SELECT}
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  )

  return result.rows[0] ? mapTodoRow(result.rows[0]) : null
}

export async function upsertTodo(input, pathId) {
  await ensureSchema()
  const todo = normalizeTodoEvent(input, pathId)
  const result = await query(
    `
      INSERT INTO todos (
        id,
        title,
        category,
        activity,
        priority,
        recurrence,
        date,
        "start",
        "end",
        location,
        notes,
        status,
        checklist,
        "order",
        top3_date,
        created_at,
        updated_at,
        completed_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, $11, $12, $13::jsonb,
        $14, $15::date, $16::timestamptz, $17::timestamptz, $18::timestamptz
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        activity = EXCLUDED.activity,
        priority = EXCLUDED.priority,
        recurrence = EXCLUDED.recurrence,
        date = EXCLUDED.date,
        "start" = EXCLUDED."start",
        "end" = EXCLUDED."end",
        location = EXCLUDED.location,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        checklist = EXCLUDED.checklist,
        "order" = EXCLUDED."order",
        top3_date = EXCLUDED.top3_date,
        created_at = COALESCE(todos.created_at, EXCLUDED.created_at),
        updated_at = EXCLUDED.updated_at,
        completed_at = EXCLUDED.completed_at
      RETURNING
        id,
        title,
        category,
        activity,
        priority,
        recurrence,
        date::text AS date,
        "start" AS start,
        "end" AS end,
        location,
        notes,
        status,
        checklist,
        "order" AS "order",
        top3_date::text AS "top3Date",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        completed_at AS "completedAt"
    `,
    [
      todo.id,
      todo.title,
      todo.category,
      todo.activity,
      todo.priority,
      todo.recurrence,
      todo.date,
      todo.start,
      todo.end,
      todo.location,
      todo.notes,
      todo.status,
      JSON.stringify(todo.checklist),
      todo.order,
      todo.top3Date,
      todo.createdAt,
      todo.updatedAt,
      todo.completedAt,
    ],
  )

  return mapTodoRow(result.rows[0])
}

export async function deleteTodo(id) {
  await ensureSchema()
  const result = await query(
    `
      DELETE FROM todos
      WHERE id = $1
      RETURNING id
    `,
    [id],
  )

  return result.rowCount > 0
}
