import type { Label, Section, Todo } from '../types/todo'
import { getRelativeDueLabel, getTodayKey, isOverdue } from '../utils/date'

const PRIORITY_BADGES = {
  P1: 'bg-rose-500 text-white',
  P2: 'bg-orange-500 text-white',
  P3: 'bg-amber-300 text-slate-900',
  P4: 'bg-emerald-200 text-emerald-900',
} as const

type TaskCardProps = {
  task: Todo
  section?: Section
  labels?: Label[]
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
        : 'bg-slate-100 text-slate-600'

  return (
    <article
      className={`rounded-[28px] border p-4 shadow-sm transition ${
        isPriority
          ? 'border-amber-200 bg-amber-50/90 shadow-[0_20px_45px_-35px_rgba(217,119,6,0.65)]'
          : 'border-slate-200 bg-white/90 hover:border-slate-300'
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className={`text-base font-semibold text-slate-900 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{section?.name ?? 'No section'}</span>
                <span className={`rounded-full px-2.5 py-1 ${PRIORITY_BADGES[task.priority]}`}>{task.priority}</span>
                {task.dueDate && (
                  <span className={`rounded-full px-2.5 py-1 ${dueBadgeClass}`}>
                    {getRelativeDueLabel(task.dueDate, todayKey)}
                  </span>
                )}
                {isPriority && <span className="rounded-full bg-amber-200 px-2.5 py-1 text-amber-900">Top 3</span>}
                {task.rolledOverOn && (
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">Rolled over</span>
                )}
                {task.completed && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Done</span>
                )}
                {labels
                  .filter((label) => task.labelIds.includes(label.id))
                  .map((label) => (
                    <span key={label.id} className="rounded-full bg-indigo-100 px-2.5 py-1 text-indigo-700">
                      #{label.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleTop3(task.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isPriority ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isPriority ? 'Remove Top 3' : 'Add to Top 3'}
              </button>
              <button
                type="button"
                onClick={() => onSelect(task.id)}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Inspect
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
