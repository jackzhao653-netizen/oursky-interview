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
      <div className="rounded-[32px] border border-amber-300/60 bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Daily focus list
              </p>
              <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)]">
                Today&apos;s 3 focus tasks
              </h2>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Choose the three tasks that deserve protected attention today. Everything else can wait.
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--bg-elevated-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
              {todos.length} of 3 slots in use
            </div>
          </div>

          {limitMessage ? (
            <div className="rounded-[22px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
              {limitMessage}
            </div>
          ) : null}

          {suggestedTodos.length > 0 ? (
            <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Suggested urgent tasks
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedTodos.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() => onToggleTop3(todo.id)}
                    className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Add &quot;{todo.title}&quot;
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {todos.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-amber-300/60 bg-[var(--bg-elevated-strong)] p-5 text-sm text-[var(--text-muted)]">
                No focus tasks are selected yet for today.
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-[26px] border border-amber-300/60 bg-[var(--bg-elevated-strong)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => onToggle(todo.id)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <p
                              className={`text-base font-semibold text-[var(--text-primary)] ${
                                todo.completed ? 'text-[var(--text-subtle)] line-through' : ''
                              }`}
                            >
                              {todo.title}
                            </p>
                            {todo.rolledOverOn ? (
                              <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                                Carried over from yesterday
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleTop3(todo.id)}
                              className="rounded-full bg-amber-200 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-300"
                            >
                              Remove from focus list
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(todo.id)}
                              className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Delete task
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {rolloverItems.length > 0 ? (
        <div className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Yesterday&apos;s unfinished focus tasks
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Restore any carry-over work that still belongs in today&apos;s focus list.
              </p>
            </div>
            <button
              type="button"
              onClick={onRestoreAll}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
            >
              Restore every available slot
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {rolloverItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] p-4"
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onRestore(item.id)}
                    className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
                  >
                    Restore to today&apos;s focus list
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismissRollover(item.id)}
                    className="rounded-full bg-[var(--bg-muted)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted-strong)]"
                  >
                    Dismiss this carry-over task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
