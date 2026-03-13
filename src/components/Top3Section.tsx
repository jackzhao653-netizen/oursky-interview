import type { Todo } from '../types/todo'
import type { RolloverItem } from '../hooks/useTodos'

type Top3SectionProps = {
  todos: Todo[]
  rolloverItems: RolloverItem[]
  limitMessage: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  onRestore: (id: string) => void
  onDismissRollover: (id: string) => void
  onRestoreAll: () => void
}

export function Top3Section({
  todos,
  rolloverItems,
  limitMessage,
  onToggle,
  onDelete,
  onToggleTop3,
  onRestore,
  onDismissRollover,
  onRestoreAll,
}: Top3SectionProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Daily focus</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">⭐ Today&apos;s Top 3</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pick up to 3 priorities so your task list stays focused instead of overwhelming.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-gray-600 shadow-sm">
            {todos.length}/3 selected today
          </div>
        </div>

        {limitMessage && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {limitMessage}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 p-5 text-sm text-gray-500">
              Choose up to 3 priorities for today.
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-400"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-base font-semibold text-gray-900 ${
                            todo.completed ? 'text-gray-400 line-through' : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.rolledOverOn && (
                          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            Rolled over from yesterday
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleTop3(todo.id)}
                          className="rounded-full bg-amber-200 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-300"
                        >
                          Remove priority
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
              </div>
            ))
          )}
        </div>
      </div>

      {rolloverItems.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Unfinished priorities from yesterday</h3>
              <p className="mt-1 text-sm text-blue-700">
                Bring them back into today&apos;s Top 3 if they still matter.
              </p>
            </div>
            <button
              type="button"
              onClick={onRestoreAll}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add back what fits
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {rolloverItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onRestore(item.id)}
                    className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Add back to today
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismissRollover(item.id)}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
