import { useMemo, useRef, useState } from 'react'
import type { PriorityLevel, Project, Section } from '../types/todo'
import { formatLongDateLabel, parseNaturalDateInput } from '../utils/date'

type TaskComposerProps = {
  projects: Project[]
  sections: Section[]
  activeProjectId: string
  onAdd: (input: {
    title: string
    projectId: string
    sectionId: string
    dueDate: string | null
    priority: PriorityLevel
  }) => boolean
}

export function TaskComposer({
  projects,
  sections,
  activeProjectId,
  onAdd,
}: TaskComposerProps) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(activeProjectId)
  const [sectionId, setSectionId] = useState('')
  const [dueInput, setDueInput] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('P3')
  const inputRef = useRef<HTMLInputElement>(null)

  const projectSections = useMemo(
    () => sections.filter((section) => section.projectId === projectId),
    [projectId, sections],
  )

  const resolvedSectionId = sectionId || projectSections[0]?.id || ''
  const resolvedDueDate = parseNaturalDateInput(dueInput)

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-[0_25px_70px_-40px_rgba(14,116,144,0.55)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">Capture</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">Add the next thing that matters</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            New work starts in the selected project and section, so the backlog stays organized from the first keystroke.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),180px,180px]">
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (dueInput.trim().length > 0 && !resolvedDueDate) {
                  return
                }

                const didAdd = onAdd({
                  title,
                  projectId,
                  sectionId: resolvedSectionId,
                  dueDate: resolvedDueDate,
                  priority,
                })
                if (didAdd) {
                  setTitle('')
                  setDueInput('')
                  setPriority('P3')
                  inputRef.current?.focus()
                }
              }
            }}
            placeholder="Write launch summary"
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />

          <select
            value={projectId}
            onChange={(event) => {
              const nextProjectId = event.target.value
              setProjectId(nextProjectId)
              const nextSections = sections.filter((section) => section.projectId === nextProjectId)
              setSectionId(nextSections[0]?.id ?? '')
            }}
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={resolvedSectionId}
            onChange={(event) => setSectionId(event.target.value)}
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            {projectSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>

        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),180px,140px,auto]">
          <input
            value={dueInput}
            onChange={(event) => setDueInput(event.target.value)}
            placeholder="Due date or phrase: tomorrow, next Monday, 2026-03-20"
            className={`min-h-12 rounded-[22px] border px-4 text-sm outline-none transition ${
              dueInput.trim().length > 0 && !resolvedDueDate
                ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-rose-100'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-400 focus:bg-white focus:ring-sky-100'
            } focus:ring-4`}
          />

          <input
            type="date"
            value={resolvedDueDate ?? ''}
            onChange={(event) => setDueInput(event.target.value)}
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as PriorityLevel)}
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            <option value="P1">P1 urgent</option>
            <option value="P2">P2 high</option>
            <option value="P3">P3 medium</option>
            <option value="P4">P4 low</option>
          </select>

          <button
            type="button"
            onClick={() => {
              if (dueInput.trim().length > 0 && !resolvedDueDate) {
                return
              }

              const didAdd = onAdd({
                title,
                projectId,
                sectionId: resolvedSectionId,
                dueDate: resolvedDueDate,
                priority,
              })
              if (didAdd) {
                setTitle('')
                setDueInput('')
                setPriority('P3')
                inputRef.current?.focus()
              }
            }}
            className="min-h-12 rounded-[22px] bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add task
          </button>
        </div>

        <div className="min-h-6 text-sm">
          {dueInput.trim().length > 0 && !resolvedDueDate ? (
            <p className="text-rose-600">Unable to parse that due date. Try a date like 2026-03-20 or a phrase like "tomorrow".</p>
          ) : resolvedDueDate ? (
            <p className="text-slate-500">Scheduled for {formatLongDateLabel(resolvedDueDate)}.</p>
          ) : (
            <p className="text-slate-400">Leave due date blank for unscheduled work.</p>
          )}
        </div>
      </div>
    </section>
  )
}
