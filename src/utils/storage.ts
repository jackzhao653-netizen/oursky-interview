import type { StoredTodoState } from '../types/todo'

export const STORAGE_KEY = 'oursky-daily-top3-todos'

const fallbackState = (today: string): StoredTodoState => ({
  todos: [],
  lastOpenedDate: today,
})

export function loadStoredState(today: string): StoredTodoState {
  if (typeof window === 'undefined') {
    return fallbackState(today)
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return fallbackState(today)
    }

    const parsed = JSON.parse(raw) as Partial<StoredTodoState>

    return {
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      lastOpenedDate:
        typeof parsed.lastOpenedDate === 'string' && parsed.lastOpenedDate.length > 0
          ? parsed.lastOpenedDate
          : today,
    }
  } catch (error) {
    console.error('Failed to load todos from localStorage', error)
    return fallbackState(today)
  }
}

export function saveStoredState(state: StoredTodoState) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save todos to localStorage', error)
  }
}
