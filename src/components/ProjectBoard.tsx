import { TaskCard } from './TaskCard'
import type { Label, Section, Todo } from '../types/todo'

type ProjectBoardProps = {
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sections</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">Work organized by flow</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {sections.map((section) => {
          const sectionTasks = tasks.filter((task) => task.sectionId === section.id)

          return (
            <div key={section.id} className="rounded-[30px] border border-slate-200 bg-white/80 p-4 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{section.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{sectionTasks.length} tasks</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {sectionTasks.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {sectionTasks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No tasks in {section.name.toLowerCase()} yet.
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
