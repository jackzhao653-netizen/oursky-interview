import { TaskCard } from './TaskCard'
import type { Label, Project, Section, Todo } from '../types/todo'
import {
  addDays,
  formatLongDateLabel,
  fromDateKey,
  getMonthLabel,
  getTodayKey,
  isOverdue,
} from '../utils/date'

type CalendarBoardProps = {
  month: Date
  selectedDateKey: string
  todayKey: string
  tasks: Todo[]
  projects: Project[]
  sections: Section[]
  labels: Label[]
  priorityIds: Set<string>
  onSelectDate: (dateKey: string) => void
  onChangeMonth: (offset: number) => void
  onJumpToToday: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  onSelectTask: (id: string) => void
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function createMonthCells(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = addDays(firstDay, -firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    return {
      date,
      dateKey: getTodayKey(date),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    }
  })
}

export function CalendarBoard({
  month,
  selectedDateKey,
  todayKey,
  tasks,
  projects,
  sections,
  labels,
  priorityIds,
  onSelectDate,
  onChangeMonth,
  onJumpToToday,
  onToggle,
  onDelete,
  onToggleTop3,
  onSelectTask,
}: CalendarBoardProps) {
  const monthCells = createMonthCells(month)
  const tasksByDate = tasks.reduce<Record<string, Todo[]>>((accumulator, task) => {
    if (!task.dueDate) {
      return accumulator
    }

    accumulator[task.dueDate] = [...(accumulator[task.dueDate] ?? []), task]
    return accumulator
  }, {})

  const selectedTasks = (tasksByDate[selectedDateKey] ?? []).filter((task) => task.parentTaskId === null)
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const scheduledThisMonth = tasks.filter((task) => {
    if (!task.dueDate || task.parentTaskId !== null) {
      return false
    }

    const dueDate = fromDateKey(task.dueDate)
    return dueDate >= monthStart && dueDate <= monthEnd
  })
  const overdueCount = tasks.filter(
    (task) => task.parentTaskId === null && task.dueDate && !task.completed && isOverdue(task.dueDate, todayKey),
  ).length
  const unscheduledCount = tasks.filter(
    (task) => task.parentTaskId === null && task.dueDate === null && !task.completed,
  ).length

  return (
    <section className="space-y-5">
      <div className="rounded-[34px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
              Calendar planner
            </p>
            <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)] sm:text-4xl">
              Monthly schedule with a daily agenda
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] sm:text-base">
              Use the month grid to spot busy days quickly, then inspect the selected day&apos;s agenda in detail.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-[var(--bg-elevated-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">Scheduled this month</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{scheduledThisMonth.length}</p>
            </div>
            <div className="rounded-[22px] bg-[var(--bg-elevated-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">Overdue</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{overdueCount}</p>
            </div>
            <div className="rounded-[22px] bg-[var(--bg-elevated-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">Unscheduled</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{unscheduledCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr),360px]">
        <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Month view
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {getMonthLabel(month)}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChangeMonth(-1)}
                className="rounded-full border border-[color:var(--border-soft)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
              >
                Previous month
              </button>
              <button
                type="button"
                onClick={onJumpToToday}
                className="rounded-full bg-[var(--bg-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted-strong)]"
              >
                Jump to today
              </button>
              <button
                type="button"
                onClick={() => onChangeMonth(1)}
                className="rounded-full border border-[color:var(--border-soft)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
              >
                Next month
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-7 gap-3">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]"
                >
                  {label}
                </div>
              ))}

              {monthCells.map((cell) => {
                const dayTasks = (tasksByDate[cell.dateKey] ?? []).filter((task) => task.parentTaskId === null)
                const isSelected = cell.dateKey === selectedDateKey
                const isToday = cell.dateKey === todayKey

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => onSelectDate(cell.dateKey)}
                    className={`min-h-[150px] rounded-[22px] border p-3 text-left ${
                      isSelected
                        ? 'border-[color:var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] hover:bg-[var(--bg-muted)]'
                    } ${cell.isCurrentMonth ? '' : 'opacity-55'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {cell.date.getDate()}
                      </span>
                      {isToday ? (
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-contrast)]">
                          Today
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayTasks.slice(0, 3).map((task) => {
                        const project = projects.find((candidate) => candidate.id === task.projectId)
                        return (
                          <div
                            key={task.id}
                            className="rounded-[16px] bg-[var(--bg-inset)] px-2.5 py-2 text-xs"
                          >
                            <p className="truncate font-semibold text-[var(--text-primary)]">{task.title}</p>
                            <p className="mt-1 truncate text-[var(--text-muted)]">
                              {project?.name ?? 'Project'}
                            </p>
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 ? (
                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                          +{dayTasks.length - 3} more tasks
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Selected day
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {formatLongDateLabel(selectedDateKey)}
              </h3>
            </div>
            <div className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {selectedTasks.length} scheduled
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {selectedTasks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[color:var(--border-soft)] bg-[var(--bg-inset)] px-4 py-5 text-sm text-[var(--text-muted)]">
                No tasks are scheduled for this day.
              </div>
            ) : (
              selectedTasks.map((task) => {
                const project = projects.find((candidate) => candidate.id === task.projectId)
                const section = sections.find((candidate) => candidate.id === task.sectionId)

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    section={section}
                    projectName={project?.name}
                    labels={labels}
                    isPriority={priorityIds.has(task.id)}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onToggleTop3={onToggleTop3}
                    onSelect={onSelectTask}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
