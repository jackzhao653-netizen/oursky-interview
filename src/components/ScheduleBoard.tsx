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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Scheduling</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="rounded-[30px] border border-slate-200 bg-white/85 p-4 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                {group.dateKey && <p className="mt-1 text-sm text-slate-500">{formatLongDateLabel(group.dateKey)}</p>}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {group.tasks.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {group.tasks.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Nothing scheduled here.
                </div>
              ) : (
                group.tasks.map((task) => {
                  const section = sections.find((candidate) => candidate.id === task.sectionId)
                  const project = projects.find((candidate) => candidate.id === task.projectId)

                  return (
                    <div key={task.id} className="space-y-2">
                      <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {project?.name ?? 'Project'} / {section?.name ?? 'Section'}
                      </div>
                      <TaskCard
                        task={task}
                        section={section}
                        labels={labels}
                        isPriority={priorityIds.has(task.id)}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onToggleTop3={onToggleTop3}
                        onSelect={onSelect}
                      />
                    </div>
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
