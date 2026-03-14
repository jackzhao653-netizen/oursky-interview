import type {
  ChecklistItem,
  PriorityLevel,
  ResolvedTodoEvent,
  TodoEvent,
  TodoEventFile,
  TodoRecurrence,
  TodoStatus,
} from "../types/todo";
import { getOccurrenceDatesInRange, getTodayKey } from "./date";

export const STORAGE_KEY = "oursky-study-timetable-checklists";

const EMPTY_FILE: TodoEventFile = {
  version: 1,
  events: [],
};

const DEFAULT_CATEGORY = "Product";

const DEFAULT_ACTIVITY = "planning";
const DEFAULT_RECURRENCE: TodoRecurrence = "once";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const LEGACY_PRIORITY_MAP: Record<string, PriorityLevel> = {
  P1: "red",
  P2: "yellow",
  P3: "green",
  P4: "white",
};

function isPriorityLevel(value: string): value is PriorityLevel {
  return (
    value === "red" ||
    value === "yellow" ||
    value === "green" ||
    value === "white"
  );
}

function isTodoRecurrence(value: string): value is TodoRecurrence {
  return value === "once" || value === "weekly" || value === "monthly";
}

function normalizeRecurrence(value: unknown): TodoRecurrence {
  if (typeof value !== "string" || !isTodoRecurrence(value)) {
    return DEFAULT_RECURRENCE;
  }

  return value;
}

function normalizePriority(value: unknown): PriorityLevel {
  if (typeof value !== "string") {
    return "green";
  }

  if (isPriorityLevel(value)) {
    return value;
  }

  return LEGACY_PRIORITY_MAP[value] ?? "green";
}

function isTodoStatus(value: string): value is TodoStatus {
  return value === "open" || value === "done" || value === "cancelled";
}

function normalizeChecklistItem(item: unknown, index: number): ChecklistItem {
  if (item && typeof item === "object") {
    const raw = item as Partial<ChecklistItem>;
    return {
      id: typeof raw.id === "string" && raw.id.length > 0 ? raw.id : createId(),
      text:
        typeof raw.text === "string" ? raw.text : `Checklist item ${index + 1}`,
      done: Boolean(raw.done),
    };
  }

  return {
    id: createId(),
    text: `Checklist item ${index + 1}`,
    done: false,
  };
}

function normalizeEvent(event: unknown, index: number): TodoEvent {
  const now = new Date().toISOString();
  const raw =
    event && typeof event === "object"
      ? ((event as Partial<TodoEvent>) as Partial<TodoEvent> & {
          course?: unknown;
          kind?: unknown;
        })
      : {};
  const date =
    typeof raw.date === "string" && raw.date.length > 0
      ? raw.date
      : getTodayKey();
  const status =
    typeof raw.status === "string" && isTodoStatus(raw.status)
      ? raw.status
      : "open";

  return {
    id: typeof raw.id === "string" && raw.id.length > 0 ? raw.id : createId(),
    title:
      typeof raw.title === "string" && raw.title.length > 0
        ? raw.title
        : "Untitled todo",
    category:
      typeof raw.category === "string" && raw.category.length > 0
        ? raw.category
        : typeof raw.course === "string" && raw.course.length > 0
          ? raw.course
        : DEFAULT_CATEGORY,
    activity:
      typeof raw.activity === "string" && raw.activity.length > 0
        ? raw.activity
        : typeof raw.kind === "string" && raw.kind.length > 0
          ? raw.kind
        : DEFAULT_ACTIVITY,
    recurrence: normalizeRecurrence(raw.recurrence),
    date,
    start: typeof raw.start === "string" ? raw.start : "",
    end: typeof raw.end === "string" ? raw.end : "",
    location: typeof raw.location === "string" ? raw.location : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    status,
    priority: normalizePriority(raw.priority),
    checklist: Array.isArray(raw.checklist)
      ? raw.checklist.map(normalizeChecklistItem)
      : [],
    top3Date:
      typeof raw.top3Date === "string" && raw.top3Date.length > 0
        ? raw.top3Date
        : null,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.length > 0
        ? raw.createdAt
        : now,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.length > 0
        ? raw.updatedAt
        : now,
    completedAt:
      typeof raw.completedAt === "string" && raw.completedAt.length > 0
        ? raw.completedAt
        : null,
    order: typeof raw.order === "number" ? raw.order : index,
  };
}

function normalizeFile(input: unknown): TodoEventFile {
  if (!input || typeof input !== "object") {
    return EMPTY_FILE;
  }

  const raw = input as Partial<TodoEventFile>;
  const events = Array.isArray(raw.events)
    ? raw.events.map(normalizeEvent)
    : [];

  return {
    version: typeof raw.version === "number" ? raw.version : 1,
    events,
  };
}

export function createEmptyTodoEvent(date = getTodayKey()): TodoEvent {
  const timestamp = new Date().toISOString();

  return {
    id: createId(),
    title: "",
    category: DEFAULT_CATEGORY,
    activity: DEFAULT_ACTIVITY,
    recurrence: DEFAULT_RECURRENCE,
    date,
    start: "",
    end: "",
    location: "",
    notes: "",
    status: "open",
    priority: "green",
    checklist: [],
    top3Date: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    order: Date.now(),
  };
}

export function sortEvents<T extends TodoEvent>(events: T[]): T[] {
  const priorityWeight: Record<PriorityLevel, number> = {
    red: 0,
    yellow: 1,
    green: 2,
    white: 3,
  };

  const statusWeight: Record<TodoStatus, number> = {
    open: 0,
    done: 1,
    cancelled: 2,
  };

  return [...events].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    if (left.status !== right.status) {
      return statusWeight[left.status] - statusWeight[right.status];
    }

    if (left.priority !== right.priority) {
      return priorityWeight[left.priority] - priorityWeight[right.priority];
    }

    if (left.start !== right.start) {
      if (!left.start) {
        return 1;
      }

      if (!right.start) {
        return -1;
      }

      return left.start.localeCompare(right.start);
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
}

export function resolveEventsInRange(
  events: TodoEvent[],
  rangeStart: string,
  rangeEnd: string,
) {
  const resolvedEvents = events.flatMap<ResolvedTodoEvent>((event) =>
    getOccurrenceDatesInRange(
      event.date,
      event.recurrence,
      rangeStart,
      rangeEnd,
    ).map((occurrenceDate) => ({
      ...event,
      date: occurrenceDate,
      sourceEventId: event.id,
      occurrenceId:
        event.recurrence === "once" && occurrenceDate === event.date
          ? event.id
          : `${event.id}::${occurrenceDate}`,
    })),
  );

  return sortEvents(resolvedEvents);
}

export async function loadEventFile() {
  if (typeof window === "undefined") {
    return EMPTY_FILE;
  }

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return normalizeFile(JSON.parse(cached));
    } catch (error) {
      console.error("Failed to parse local event cache", error);
    }
  }

  try {
    const response = await fetch("/events.json");
    if (response.ok) {
      const data = await response.json();
      const file = normalizeFile(data);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
      return file;
    }
  } catch (error) {
    console.error("Failed to load seeded events.json", error);
  }

  return EMPTY_FILE;
}

export function saveEventFile(file: TodoEventFile) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    version: file.version,
    events: sortEvents(file.events),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function resetEventFileCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
