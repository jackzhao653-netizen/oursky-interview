import type { Label, PriorityLevel, Project, Section, Todo } from '../types/todo'

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

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  P1: 'bg-rose-500 text-white',
  P2: 'bg-orange-500 text-white',
  P3: 'bg-amber-300 text-slate-900',
  P4: 'bg-emerald-200 text-emerald-900',
}

type TaskInspectorProps = {
  task: Todo | null
  projects: Project[]
  sections: Section[]
  labels: Label[]
  onSelectTask: (taskId: string | null) => void
  onUpdateTask: (
    taskId: string,
    updates: Partial<Todo>,
    options?: { activityMessage?: string; activityType?: Todo['activity'][number]['type'] },
  ) => void
}

export function TaskInspector({
  task,
  projects,
  sections,
  labels,
  onSelectTask,
  onUpdateTask,
}: TaskInspectorProps) {
  if (!task) {
    return (
      <aside className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Task details
        </p>
        <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)]">
          Select a task to edit its details
        </h2>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Use the &quot;Edit details&quot; button on any task card to update its project, workflow stage,
          due date, or labels.
        </p>
      </aside>
    )
  }

  const projectSections = sections.filter((section) => section.projectId === task.projectId)

  return (
    <aside className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            Task details
          </p>
          <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)]">
            Edit the selected task
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onSelectTask(null)}
          className="rounded-full bg-[var(--bg-muted)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted-strong)]"
        >
          Close
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="inspector-title" className="text-sm font-semibold text-[var(--text-primary)]">
            Task title
          </label>
          <input
            id="inspector-title"
            value={task.title}
            onChange={(event) =>
              onUpdateTask(task.id, { title: event.target.value }, { activityMessage: 'Updated task title' })
            }
            className="mt-2 min-h-12 w-full rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Priority</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['P1', 'P2', 'P3', 'P4'] as PriorityLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  onUpdateTask(task.id, { priority: level }, { activityMessage: `Set priority to ${level}` })
                }
                className={`rounded-[18px] px-3 py-2 text-sm font-semibold ${
                  task.priority === level ? PRIORITY_STYLES[level] : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="inspector-project" className="text-sm font-semibold text-[var(--text-primary)]">
              Project
            </label>
            <select
              id="inspector-project"
              value={task.projectId}
              onChange={(event) => {
                const nextProjectId = event.target.value
                const nextSection = sections.find((section) => section.projectId === nextProjectId)

                onUpdateTask(
                  task.id,
                  {
                    projectId: nextProjectId,
                    sectionId: nextSection?.id ?? task.sectionId,
                  },
                  { activityMessage: 'Moved task to another project', activityType: 'moved' },
                )
              }}
              className="mt-2 min-h-12 w-full rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="inspector-section" className="text-sm font-semibold text-[var(--text-primary)]">
              Workflow stage
            </label>
            <select
              id="inspector-section"
              value={task.sectionId}
              onChange={(event) =>
                onUpdateTask(
                  task.id,
                  { sectionId: event.target.value },
                  { activityMessage: 'Moved task to another section', activityType: 'moved' },
                )
              }
              className="mt-2 min-h-12 w-full rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
            >
              {projectSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inspector-due-date" className="text-sm font-semibold text-[var(--text-primary)]">
            Due date
          </label>
          <input
            id="inspector-due-date"
            type="date"
            value={task.dueDate ?? ''}
            onChange={(event) =>
              onUpdateTask(
                task.id,
                { dueDate: event.target.value || null },
                { activityMessage: event.target.value ? 'Scheduled due date' : 'Cleared due date' },
              )
            }
            className="mt-2 min-h-12 w-full rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Labels</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <span className="text-sm text-[var(--text-muted)]">
                Create labels in the filter panel, then assign them here.
              </span>
            ) : (
              labels.map((label) => {
                const active = task.labelIds.includes(label.id)
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() =>
                      onUpdateTask(
                        task.id,
                        {
                          labelIds: active
                            ? task.labelIds.filter((labelId) => labelId !== label.id)
                            : [...task.labelIds, label.id],
                        },
                        { activityMessage: 'Updated task labels' },
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      active ? 'ring-2 ring-[var(--accent)]' : ''
                    } ${LABEL_STYLES[label.color]}`}
                  >
                    #{label.name}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
