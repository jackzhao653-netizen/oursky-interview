import type { RolloverItem, Todo } from '../types/todo'

type Top3SectionProps = {
  todos: Todo[]
  suggestedTodos: Todo[]
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
  suggestedTodos,
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
      <div className="rounded-[34px] border border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(253,224,71,0.35),_transparent_32%),linear-gradient(135deg,#fff8db_0%,#fffdf7_45%,#ffffff_100%)] p-5 shadow-[0_28px_70px_-45px_rgba(217,119,6,0.65)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Daily focus</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">Today&apos;s Top 3</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick up to 3 priorities so your task list stays focused instead of overwhelming.
            </p>
          </div>
          <div className="rounded-[22px] bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
            {todos.length}/3 selected today
          </div>
        </div>

        {limitMessage && (
          <div className="mt-4 rounded-[22px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
            {limitMessage}
          </div>
        )}

        {suggestedTodos.length > 0 && (
          <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Suggested from P1 tasks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTodos.map((todo) => (
                <button
                  key={todo.id}
                  type="button"
                  onClick={() => onToggleTop3(todo.id)}
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                >
                  {todo.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {todos.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-amber-200 bg-white/70 p-5 text-sm text-slate-500">
              Choose up to 3 priorities for today.
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="rounded-[28px] border border-amber-200 bg-white/95 p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-base font-semibold text-slate-900 ${
                            todo.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.rolledOverOn && (
                          <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
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
                          className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
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
        <div className="rounded-[28px] border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Unfinished priorities from yesterday</h3>
              <p className="mt-1 text-sm text-sky-700">
                Bring them back into today&apos;s Top 3 if they still matter.
              </p>
            </div>
            <button
              type="button"
              onClick={onRestoreAll}
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Add back what fits
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {rolloverItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[24px] border border-sky-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onRestore(item.id)}
                    className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700"
                  >
                    Add back to today
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismissRollover(item.id)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
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
