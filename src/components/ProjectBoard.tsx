import { TaskCard } from './TaskCard'
import type { Label, Project, Section, Todo } from '../types/todo'

type ProjectBoardProps = {
  project: Project | null
  sections: Section[]
  tasks: Todo[]
  labels: Label[]
  priorityIds: Set<string>
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  onSelect: (id: string) => void
}

export function ProjectBoard({
  project,
  sections,
  tasks,
  labels,
  priorityIds,
  onToggle,
  onDelete,
  onToggleTop3,
  onSelect,
}: ProjectBoardProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] backdrop-blur sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Project workflow
        </p>
        <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)] sm:text-4xl">
          {project ? `${project.name} workflow board` : 'Workflow board'}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] sm:text-base">
          Each task is grouped by its workflow stage so it is obvious what is waiting, what is active,
          and what is finished.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {sections.map((section) => {
          const sectionTasks = tasks.filter((task) => task.sectionId === section.id)

          return (
            <div
              key={section.id}
              className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-soft)] backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{section.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <div className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {sectionTasks.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {sectionTasks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-[color:var(--border-soft)] bg-[var(--bg-inset)] px-4 py-5 text-sm text-[var(--text-muted)]">
                    No tasks are currently in {section.name.toLowerCase()}.
                  </div>
                ) : (
                  sectionTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      section={section}
                      labels={labels}
                      isPriority={priorityIds.has(task.id)}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onToggleTop3={onToggleTop3}
                      onSelect={onSelect}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
