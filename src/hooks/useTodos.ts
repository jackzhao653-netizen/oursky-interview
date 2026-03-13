import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '../types/todo'
import { saveStoredState, STORAGE_KEY } from '../utils/storage'

export type RolloverItem = {
  id: string
  title: string
}

const getTodayKey = () => new Date().toISOString().slice(0, 10)

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createInitialState = () => {
  const today = getTodayKey()

  if (typeof window === 'undefined') {
    return {
      today,
      todos: [] as Todo[],
      rolloverItems: [] as RolloverItem[],
      lastOpenedDate: today,
      isLoaded: false,
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return {
        today,
        todos: [] as Todo[],
        rolloverItems: [] as RolloverItem[],
        lastOpenedDate: today,
        isLoaded: true,
      }
    }

    const parsed = JSON.parse(raw) as {
      todos?: Todo[]
      lastOpenedDate?: string
    }

    const storedTodos = Array.isArray(parsed.todos) ? parsed.todos : []
    const previousDate = typeof parsed.lastOpenedDate === 'string' ? parsed.lastOpenedDate : today
    const rolloverItems: RolloverItem[] = []

    const todos =
      previousDate === today
        ? storedTodos
        : storedTodos.map((todo) => {
            if (todo.top3Date === previousDate && !todo.completed) {
              rolloverItems.push({ id: todo.id, title: todo.title })
              return {
                ...todo,
                top3Date: null,
              }
            }

            return todo
          })

    return {
      today,
      todos,
      rolloverItems,
      lastOpenedDate: today,
      isLoaded: true,
    }
  } catch (error) {
    console.error('Failed to load todos from localStorage', error)
    return {
      today,
      todos: [] as Todo[],
      rolloverItems: [] as RolloverItem[],
      lastOpenedDate: today,
      isLoaded: true,
    }
  }
}

export function useTodos() {
  const initialState = useMemo(() => createInitialState(), [])
  const [todos, setTodos] = useState<Todo[]>(initialState.todos)
  const [rolloverItems, setRolloverItems] = useState<RolloverItem[]>(initialState.rolloverItems)
  const [lastOpenedDate] = useState(initialState.lastOpenedDate)
  const [isLoaded] = useState(initialState.isLoaded)
  const [limitMessage, setLimitMessage] = useState('')

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    saveStoredState({
      todos,
      lastOpenedDate,
    })
  }, [todos, lastOpenedDate, isLoaded])

  useEffect(() => {
    if (!limitMessage) {
      return
    }

    const timer = window.setTimeout(() => setLimitMessage(''), 2500)
    return () => window.clearTimeout(timer)
  }, [limitMessage])

  const today = initialState.today
  const top3Todos = todos.filter((todo) => todo.top3Date === today)
  const otherTodos = todos.filter((todo) => todo.top3Date !== today)

  const addTodo = (title: string) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return false
    }

    setTodos((current) => [
      {
        id: createId(),
        title: trimmedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
        top3Date: null,
        rolledOverOn: null,
      },
      ...current,
    ])

    return true
  }

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
    setRolloverItems((current) => current.filter((todo) => todo.id !== id))
  }

  const toggleTop3 = (id: string) => {
    let changed = false

    setTodos((current) => {
      const target = current.find((todo) => todo.id === id)
      if (!target) {
        return current
      }

      if (target.top3Date === today) {
        changed = true
        return current.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                top3Date: null,
                rolledOverOn: null,
              }
            : todo,
        )
      }

      const top3Count = current.filter((todo) => todo.top3Date === today).length
      if (top3Count >= 3) {
        setLimitMessage('You already picked 3 priorities for today.')
        return current
      }

      changed = true
      return current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              top3Date: today,
            }
          : todo,
      )
    })

    if (changed) {
      setRolloverItems((current) => current.filter((todo) => todo.id !== id))
    }
  }

  const restoreRollover = (id: string) => {
    if (top3Todos.length >= 3) {
      setLimitMessage('You already picked 3 priorities for today.')
      return
    }

    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              top3Date: today,
              rolledOverOn: today,
            }
          : todo,
      ),
    )
    setRolloverItems((current) => current.filter((todo) => todo.id !== id))
  }

  const dismissRollover = (id: string) => {
    setRolloverItems((current) => current.filter((todo) => todo.id !== id))
  }

  const restoreAllRollovers = () => {
    const availableSlots = 3 - top3Todos.length

    if (availableSlots <= 0) {
      setLimitMessage('You already picked 3 priorities for today.')
      return
    }

    const idsToRestore = rolloverItems.slice(0, availableSlots).map((item) => item.id)

    setTodos((current) =>
      current.map((todo) =>
        idsToRestore.includes(todo.id)
          ? {
              ...todo,
              top3Date: today,
              rolledOverOn: today,
            }
          : todo,
      ),
    )
    setRolloverItems((current) => current.filter((item) => !idsToRestore.includes(item.id)))

    if (rolloverItems.length > availableSlots) {
      setLimitMessage('Only enough room to restore the remaining priority slots.')
    }
  }

  return {
    today,
    todos,
    top3Todos,
    otherTodos,
    rolloverItems,
    isLoaded,
    limitMessage,
    addTodo,
    toggleTodo,
    deleteTodo,
    toggleTop3,
    restoreRollover,
    dismissRollover,
    restoreAllRollovers,
  }
}
