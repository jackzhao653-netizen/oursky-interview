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
      <aside className="rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Inspector</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-950">Select a task</h2>
        <p className="mt-3 text-sm text-slate-500">
          Use Inspect on any task card to edit priority, section, and due date details.
        </p>
      </aside>
    )
  }

  const projectSections = sections.filter((section) => section.projectId === task.projectId)

  return (
    <aside className="rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Inspector</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-950">Task details</h2>
        </div>
        <button
          type="button"
          onClick={() => onSelectTask(null)}
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600"
        >
          Close
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="inspector-title" className="text-sm font-semibold text-slate-700">
            Title
          </label>
          <input
            id="inspector-title"
            value={task.title}
            onChange={(event) =>
              onUpdateTask(
                task.id,
                { title: event.target.value },
                { activityMessage: 'Updated task title' },
              )
            }
            className="mt-2 min-h-12 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Priority</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(['P1', 'P2', 'P3', 'P4'] as PriorityLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  onUpdateTask(
                    task.id,
                    { priority: level },
                    { activityMessage: `Set priority to ${level}` },
                  )
                }
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  task.priority === level ? PRIORITY_STYLES[level] : 'bg-slate-100 text-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="inspector-project" className="text-sm font-semibold text-slate-700">
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
              className="mt-2 min-h-12 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="inspector-section" className="text-sm font-semibold text-slate-700">
              Section
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
              className="mt-2 min-h-12 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
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
          <label htmlFor="inspector-due-date" className="text-sm font-semibold text-slate-700">
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
            className="mt-2 min-h-12 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Labels</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <span className="text-sm text-slate-400">Create labels in the filter panel, then assign them here.</span>
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
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      active ? 'ring-2 ring-slate-900' : ''
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
