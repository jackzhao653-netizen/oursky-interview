import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  isPriority: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
}

export function TodoItem({ todo, isPriority, onToggle, onDelete, onToggleTop3 }: TodoItemProps) {
  return (
    <li
      className={`group rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
        isPriority
          ? 'border-amber-200 bg-amber-50/80'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-400"
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`text-base font-medium text-gray-900 ${
                  todo.completed ? 'text-gray-400 line-through' : ''
                }`}
              >
                {todo.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                {isPriority && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">Top 3</span>
                )}
                {todo.rolledOverOn && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">Rolled over</span>
                )}
                {todo.completed && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-700">Done</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleTop3(todo.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isPriority
                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPriority ? 'Remove priority' : 'Set as Top 3'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
