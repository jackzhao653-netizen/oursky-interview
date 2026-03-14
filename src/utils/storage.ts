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
const PENDING_MUTATIONS_KEY = "oursky-study-timetable-pending-mutations";
export const PERSISTENCE_NOTICE_EVENT = "oursky-persistence-notice";

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
    recurrenceCount: typeof raw.recurrenceCount === "number" ? raw.recurrenceCount : null,
    recurrenceEndDate: typeof raw.recurrenceEndDate === "string" && raw.recurrenceEndDate.length > 0 ? raw.recurrenceEndDate : null,
    completedOccurrences: Array.isArray(raw.completedOccurrences) ? raw.completedOccurrences.filter((d): d is string => typeof d === "string") : [],
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
    recurrenceCount: null,
    recurrenceEndDate: null,
    completedOccurrences: [],
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
      event.recurrenceCount,
      event.recurrenceEndDate,
    ).map((occurrenceDate) => {
      // Check if this occurrence was completed
      const isCompleted = event.completedOccurrences.includes(occurrenceDate);
      
      return {
        ...event,
        date: occurrenceDate,
        status: isCompleted ? "done" : event.status,
        completedAt: isCompleted ? new Date().toISOString() : event.completedAt,
        sourceEventId: event.id,
        occurrenceId:
          event.recurrence === "once" && occurrenceDate === event.date
            ? event.id
            : `${event.id}::${occurrenceDate}`,
      };
    }),
  );

  return sortEvents(resolvedEvents);
}

type PendingMutation =
  | {
      type: "upsert";
      eventId: string;
      event: TodoEvent;
      queuedAt: string;
    }
  | {
      type: "delete";
      eventId: string;
      queuedAt: string;
    };

let lastLocalFile: TodoEventFile | null = null;
let flushQueue = Promise.resolve();
let syncListenerAttached = false;

function emitPersistenceNotice(message: string) {
  // Disabled: notifications removed per user request
  return;
  
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(PERSISTENCE_NOTICE_EVENT, {
      detail: { message },
    }),
  );
}

function readCachedFile() {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) {
    return null;
  }

  try {
    return normalizeFile(JSON.parse(cached));
  } catch (error) {
    console.error("Failed to parse local event cache", error);
    return null;
  }
}

function writeCachedFile(file: TodoEventFile) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    version: file.version,
    events: sortEvents(file.events),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizePendingMutation(input: unknown): PendingMutation | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Partial<PendingMutation> & { event?: unknown };
  if (typeof raw.eventId !== "string" || raw.eventId.length === 0) {
    return null;
  }

  const queuedAt =
    typeof raw.queuedAt === "string" && raw.queuedAt.length > 0
      ? raw.queuedAt
      : new Date().toISOString();

  if (raw.type === "delete") {
    return {
      type: "delete",
      eventId: raw.eventId,
      queuedAt,
    };
  }

  if (raw.type === "upsert") {
    return {
      type: "upsert",
      eventId: raw.eventId,
      event: normalizeEvent(raw.event, 0),
      queuedAt,
    };
  }

  return null;
}

function readPendingMutations() {
  if (typeof window === "undefined") {
    return [] as PendingMutation[];
  }

  const cached = window.localStorage.getItem(PENDING_MUTATIONS_KEY);
  if (!cached) {
    return [] as PendingMutation[];
  }

  try {
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed)
      ? parsed
          .map(normalizePendingMutation)
          .filter((mutation): mutation is PendingMutation => mutation !== null)
      : [];
  } catch (error) {
    console.error("Failed to parse pending event mutations", error);
    return [];
  }
}

function writePendingMutations(mutations: PendingMutation[]) {
  if (typeof window === "undefined") {
    return;
  }

  if (mutations.length === 0) {
    window.localStorage.removeItem(PENDING_MUTATIONS_KEY);
    return;
  }

  window.localStorage.setItem(
    PENDING_MUTATIONS_KEY,
    JSON.stringify(mutations),
  );
}

function getEventFingerprint(event: TodoEvent) {
  return JSON.stringify({
    id: event.id,
    title: event.title,
    category: event.category,
    activity: event.activity,
    priority: event.priority,
    recurrence: event.recurrence,
    date: event.date,
    start: event.start,
    end: event.end,
    location: event.location,
    notes: event.notes,
    status: event.status,
    checklist: event.checklist.map((item) => ({
      id: item.id,
      text: item.text,
      done: item.done,
    })),
    order: event.order,
    top3Date: event.top3Date,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    completedAt: event.completedAt,
  });
}

function buildPendingMutations(
  previousFile: TodoEventFile,
  nextFile: TodoEventFile,
) {
  const previousById = new Map(previousFile.events.map((event) => [event.id, event]));
  const nextById = new Map(nextFile.events.map((event) => [event.id, event]));
  const mutations: PendingMutation[] = [];

  nextFile.events.forEach((event) => {
    const previousEvent = previousById.get(event.id);
    if (
      !previousEvent ||
      getEventFingerprint(previousEvent) !== getEventFingerprint(event)
    ) {
      mutations.push({
        type: "upsert",
        eventId: event.id,
        event,
        queuedAt: new Date().toISOString(),
      });
    }
  });

  previousFile.events.forEach((event) => {
    if (!nextById.has(event.id)) {
      mutations.push({
        type: "delete",
        eventId: event.id,
        queuedAt: new Date().toISOString(),
      });
    }
  });

  return mutations;
}

function compactPendingMutations(mutations: PendingMutation[]) {
  const latestById = new Map<string, PendingMutation>();

  mutations.forEach((mutation) => {
    latestById.set(mutation.eventId, mutation);
  });

  const seenEventIds = new Set<string>();

  return [...mutations]
    .reverse()
    .filter((mutation) => {
      if (seenEventIds.has(mutation.eventId)) {
        return false;
      }

      seenEventIds.add(mutation.eventId);
      return true;
    })
    .reverse()
    .map((mutation) => latestById.get(mutation.eventId) ?? mutation);
}

async function readRemoteEventFile() {
  // Skip API in development
  if (import.meta.env.DEV) {
    throw new Error('API not available in development mode');
  }
  
  const response = await fetch("/api/todos", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch todos (${response.status})`);
  }

  return normalizeFile(await response.json());
}

async function readSeedEventFile() {
  try {
    const response = await fetch("/events.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      return EMPTY_FILE;
    }

    return normalizeFile(await response.json());
  } catch (error) {
    console.error("Failed to load seeded events.json", error);
    return EMPTY_FILE;
  }
}

async function sendMutation(mutation: PendingMutation) {
  // Skip API calls in development if API server isn't running
  if (import.meta.env.DEV) {
    console.log('[DEV] Skipping API sync:', mutation.type, mutation.eventId);
    return;
  }
  
  const endpoint = `/api/todos/${encodeURIComponent(mutation.eventId)}`;
  const response =
    mutation.type === "delete"
      ? await fetch(endpoint, {
          method: "DELETE",
        })
      : await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(mutation.event),
        });

  if (!response.ok) {
    throw new Error(`Failed to sync todo ${mutation.eventId}`);
  }
}

async function flushPendingMutationsInternal() {
  if (typeof window === "undefined") {
    return;
  }

  if (navigator.onLine === false) {
    emitPersistenceNotice("Offline mode active. Changes are saved locally.");
    return;
  }

  const pending = readPendingMutations();
  if (pending.length === 0) {
    return;
  }

  for (const mutation of pending) {
    await sendMutation(mutation);
    const remaining = readPendingMutations().filter(
      (queuedMutation) =>
        !(
          queuedMutation.eventId === mutation.eventId &&
          queuedMutation.queuedAt === mutation.queuedAt &&
          queuedMutation.type === mutation.type
        ),
    );
    writePendingMutations(remaining);
  }

  emitPersistenceNotice("Database sync restored.");
}

function flushPendingMutations() {
  flushQueue = flushQueue
    .catch(() => undefined)
    .then(async () => {
      try {
        await flushPendingMutationsInternal();
      } catch (error) {
        console.error("Failed to flush queued todo mutations", error);
        emitPersistenceNotice("Database unavailable. Using local cache.");
      }
    });

  return flushQueue;
}

export function startPersistenceSync() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleOnline = () => {
    void flushPendingMutations();
  };

  if (!syncListenerAttached) {
    window.addEventListener("online", handleOnline);
    syncListenerAttached = true;
  }

  void flushPendingMutations();

  return () => {
    if (!syncListenerAttached) {
      return;
    }

    window.removeEventListener("online", handleOnline);
    syncListenerAttached = false;
  };
}

export async function loadEventFile() {
  if (typeof window === "undefined") {
    return EMPTY_FILE;
  }

  const cachedFile = readCachedFile();
  const pendingMutations = readPendingMutations();

  if (pendingMutations.length > 0 && cachedFile) {
    lastLocalFile = cachedFile;
    emitPersistenceNotice("Loaded local changes while waiting for database sync.");
    void flushPendingMutations();
    return cachedFile;
  }

  try {
    const remoteFile = await readRemoteEventFile();

    if (remoteFile.events.length === 0) {
      if (cachedFile && cachedFile.events.length > 0) {
        writeCachedFile(cachedFile);
        lastLocalFile = EMPTY_FILE;
        emitPersistenceNotice("Using local tasks and syncing them to the database.");
        return cachedFile;
      }

      const seedFile = await readSeedEventFile();
      if (seedFile.events.length > 0) {
        writeCachedFile(seedFile);
        lastLocalFile = EMPTY_FILE;
        return seedFile;
      }
    }

    writeCachedFile(remoteFile);
    lastLocalFile = remoteFile;
    return remoteFile;
  } catch (error) {
    console.error("Failed to load todos from API", error);

    if (cachedFile) {
      lastLocalFile = cachedFile;
      emitPersistenceNotice("Database unavailable. Loaded local cache instead.");
      void flushPendingMutations();
      return cachedFile;
    }
  }

  const seedFile = await readSeedEventFile();
  if (seedFile.events.length > 0) {
    writeCachedFile(seedFile);
    lastLocalFile = EMPTY_FILE;
    emitPersistenceNotice("Loaded starter tasks locally until the database is available.");
    return seedFile;
  }

  lastLocalFile = EMPTY_FILE;
  return EMPTY_FILE;
}

export async function saveEventFile(file: TodoEventFile) {
  if (typeof window === "undefined") {
    return;
  }

  const previousFile = lastLocalFile ?? readCachedFile() ?? EMPTY_FILE;
  const payload = normalizeFile({
    version: file.version,
    events: sortEvents(file.events),
  });

  writeCachedFile(payload);
  lastLocalFile = payload;

  const nextMutations = buildPendingMutations(previousFile, payload);
  if (nextMutations.length === 0) {
    return;
  }

  writePendingMutations(
    compactPendingMutations([...readPendingMutations(), ...nextMutations]),
  );
  await flushPendingMutations();
}

export function resetEventFileCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(PENDING_MUTATIONS_KEY);
  lastLocalFile = EMPTY_FILE;
}
