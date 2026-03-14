import {
  INBOX_BACKLOG_SECTION_ID,
  INBOX_DONE_SECTION_ID,
  INBOX_IN_PROGRESS_SECTION_ID,
  INBOX_PROJECT_ID,
  type Project,
  type Section,
  type StoredTodoState,
  type Todo,
} from '../types/todo'

export const STORAGE_KEY = 'oursky-daily-top3-todos'

const DB_NAME = 'oursky-task-manager'
const DB_VERSION = 1
const STORE_NAME = 'task-manager'
const STATE_KEY = 'primary'

type LegacyStoredState = {
  todos?: Array<{
    id: string
    title: string
    completed: boolean
    createdAt: string
    top3Date: string | null
    rolledOverOn: string | null
  }>
  lastOpenedDate?: string
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

async function openDatabase() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const createInboxProject = (): Project => ({
  id: INBOX_PROJECT_ID,
  name: 'Inbox',
  color: '#2563eb',
  sectionIds: [INBOX_BACKLOG_SECTION_ID, INBOX_IN_PROGRESS_SECTION_ID, INBOX_DONE_SECTION_ID],
  collapsed: false,
  isInbox: true,
})

const createInboxSections = (): Section[] => [
  { id: INBOX_BACKLOG_SECTION_ID, projectId: INBOX_PROJECT_ID, name: 'Backlog' },
  { id: INBOX_IN_PROGRESS_SECTION_ID, projectId: INBOX_PROJECT_ID, name: 'In Progress' },
  { id: INBOX_DONE_SECTION_ID, projectId: INBOX_PROJECT_ID, name: 'Done' },
]

export function createDefaultStoredState(today: string): StoredTodoState {
  return {
    version: 1,
    tasks: [],
    projects: [createInboxProject()],
    sections: createInboxSections(),
    labels: [],
    savedFilters: [],
    rolloverItems: [],
    lastOpenedDate: today,
    dailyCapacityMinutes: 240,
  }
}

export async function loadStoredState() {
  const database = await openDatabase()
  if (!database) {
    return null
  }

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const result = await requestToPromise(store.get(STATE_KEY))
    await transactionToPromise(transaction)
    return (result as StoredTodoState | undefined) ?? null
  } finally {
    database.close()
  }
}

export async function saveStoredState(state: StoredTodoState) {
  const database = await openDatabase()
  if (!database) {
    return
  }

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put(state, STATE_KEY)
    await transactionToPromise(transaction)
  } finally {
    database.close()
  }
}

function normalizeLegacyTask(task: NonNullable<LegacyStoredState['todos']>[number]): Todo {
  const timestamp = task.createdAt ?? new Date().toISOString()
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    completedAt: task.completed ? timestamp : null,
    skippedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    projectId: INBOX_PROJECT_ID,
    sectionId: INBOX_BACKLOG_SECTION_ID,
    top3Date: task.top3Date ?? null,
    rolledOverOn: task.rolledOverOn ?? null,
    dueDate: null,
    priority: 'P3',
    labelIds: [],
    parentTaskId: null,
    subtaskIds: [],
    description: '',
    attachments: [],
    comments: [],
    activity: [
      {
        id: `${task.id}-legacy-import`,
        type: 'created',
        message: 'Imported from the Daily Top-3 MVP',
        createdAt: timestamp,
      },
    ],
    estimateMinutes: null,
    timerStartedAt: null,
    trackedMinutes: 0,
    recurrence: null,
    recurringTaskId: null,
  }
}

export function loadLegacyLocalStorageState(today: string) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as LegacyStoredState
    const fallback = createDefaultStoredState(today)

    return {
      ...fallback,
      tasks: Array.isArray(parsed.todos) ? parsed.todos.map(normalizeLegacyTask) : [],
      lastOpenedDate:
        typeof parsed.lastOpenedDate === 'string' && parsed.lastOpenedDate.length > 0
          ? parsed.lastOpenedDate
          : today,
    }
  } catch (error) {
    console.error('Failed to migrate localStorage state', error)
    return null
  }
}

export function clearLegacyLocalStorageState() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
