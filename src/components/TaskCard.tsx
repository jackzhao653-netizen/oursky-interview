import type { Label, Section, Todo } from '../types/todo'
import { getRelativeDueLabel, getTodayKey, isOverdue } from '../utils/date'

const PRIORITY_BADGES = {
  P1: 'bg-rose-500 text-white',
  P2: 'bg-orange-500 text-white',
  P3: 'bg-amber-300 text-slate-900',
  P4: 'bg-emerald-200 text-emerald-900',
} as const

const LABEL_STYLES = {
  slate: 'bg-slate-200 text-slate-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-700',
  teal: 'bg-teal-100 text-teal-700',
  sky: 'bg-sky-100 text-sky-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  pink: 'bg-pink-100 text-pink-700',
} as const

type TaskCardProps = {
  task: Todo
  section?: Section
  labels?: Label[]
  projectName?: string
  isPriority: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  onSelect: (id: string) => void
}

export function TaskCard({
  task,
  section,
  labels = [],
  projectName,
  isPriority,
  onToggle,
  onDelete,
  onToggleTop3,
  onSelect,
}: TaskCardProps) {
  const todayKey = getTodayKey()
  const dueBadgeClass =
    task.dueDate && isOverdue(task.dueDate, todayKey)
      ? 'bg-rose-100 text-rose-700'
      : task.dueDate === todayKey
        ? 'bg-sky-100 text-sky-700'
        : 'bg-slate-200 text-slate-700'

  return (
    <article
      className={`rounded-[28px] border p-4 ${
        isPriority
          ? 'border-amber-300/60 bg-[color:var(--warning-soft)] shadow-[var(--shadow-soft)]'
          : 'border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] shadow-[var(--shadow-soft)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p
                className={`text-base font-semibold text-[var(--text-primary)] ${
                  task.completed ? 'text-[var(--text-subtle)] line-through' : ''
                }`}
              >
                {task.title}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {projectName ? (
                  <span className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[var(--text-secondary)]">
                    {projectName}
                  </span>
                ) : null}
                <span className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[var(--text-secondary)]">
                  {section?.name ?? 'No workflow stage'}
                </span>
                <span className={`rounded-full px-2.5 py-1 ${PRIORITY_BADGES[task.priority]}`}>
                  {task.priority}
                </span>
                {task.dueDate ? (
                  <span className={`rounded-full px-2.5 py-1 ${dueBadgeClass}`}>
                    {getRelativeDueLabel(task.dueDate, todayKey)}
                  </span>
                ) : null}
                {isPriority ? (
                  <span className="rounded-full bg-amber-200 px-2.5 py-1 text-amber-900">
                    Today&apos;s focus list
                  </span>
                ) : null}
                {task.rolledOverOn ? (
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">
                    Carried over from yesterday
                  </span>
                ) : null}
                {task.completed ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                    Completed
                  </span>
                ) : null}
                {labels
                  .filter((label) => task.labelIds.includes(label.id))
                  .map((label) => (
                    <span
                      key={label.id}
                      className={`rounded-full px-2.5 py-1 ${LABEL_STYLES[label.color]}`}
                    >
                      #{label.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                type="button"
                onClick={() => onToggleTop3(task.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  isPriority
                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted-strong)]'
                }`}
              >
                {isPriority ? 'Remove from focus list' : 'Add to focus list'}
              </button>
              <button
                type="button"
                onClick={() => onSelect(task.id)}
                className="rounded-full border border-[color:var(--border-soft)] bg-transparent px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
              >
                Edit details
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                Delete task
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
