import { useRef, useState } from 'react'

type AddTodoProps = {
  onAdd: (title: string) => boolean
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const didAdd = onAdd(title)

    if (!didAdd) {
      return
    }

    setTitle('')
    inputRef.current?.focus()
  }

  const clear = () => {
    setTitle('')
    inputRef.current?.focus()
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <label htmlFor="todo-input" className="mb-2 block text-sm font-medium text-gray-700">
        Add a new task
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="todo-input"
          ref={inputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              clear()
            }
          }}
          placeholder="Add new task..."
          className="min-h-12 flex-1 rounded-xl border border-gray-200 px-4 text-base text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={submit}
          className="min-h-12 rounded-xl bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          Add task
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-500">Press Enter to add, or Escape to clear the field.</p>
    </div>
  )
}
