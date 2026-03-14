import { TaskCard } from './TaskCard'
import type { Label, Project, Section, Todo } from '../types/todo'
import { formatLongDateLabel } from '../utils/date'

type ScheduleGroup = {
  title: string
  dateKey?: string
  tasks: Todo[]
}

type ScheduleBoardProps = {
  title: string
  subtitle: string
  groups: ScheduleGroup[]
  projects: Project[]
  sections: Section[]
  labels: Label[]
  priorityIds: Set<string>
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  onSelect: (id: string) => void
}

export function ScheduleBoard({
  title,
  subtitle,
  groups,
  projects,
  sections,
  labels,
  priorityIds,
  onToggle,
  onDelete,
  onToggleTop3,
  onSelect,
}: ScheduleBoardProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] backdrop-blur sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Schedule
        </p>
        <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] sm:text-base">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{group.title}</h3>
                {group.dateKey ? (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {formatLongDateLabel(group.dateKey)}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                {group.tasks.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {group.tasks.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[color:var(--border-soft)] bg-[var(--bg-inset)] px-4 py-5 text-sm text-[var(--text-muted)]">
                  No tasks are scheduled in this time block.
                </div>
              ) : (
                group.tasks.map((task) => {
                  const section = sections.find((candidate) => candidate.id === task.sectionId)
                  const project = projects.find((candidate) => candidate.id === task.projectId)

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
                      onSelect={onSelect}
                    />
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
