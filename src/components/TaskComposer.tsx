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

  const submit = () => {
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

    if (!didAdd) {
      return
    }

    setTitle('')
    setDueInput('')
    setPriority('P3')
    inputRef.current?.focus()
  }

  return (
    <section className="rounded-[34px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
              Quick task capture
            </p>
            <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)] sm:text-4xl">
              Add a task with the right project, stage, and due date
            </h2>
          </div>
          <p className="max-w-md text-sm text-[var(--text-muted)]">
            New work is organized before it lands in the list, so the rest of the workspace stays tidy.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr),200px,200px]">
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Example: Prepare launch notes for Monday review"
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-base text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />

          <select
            value={projectId}
            onChange={(event) => {
              const nextProjectId = event.target.value
              setProjectId(nextProjectId)
              const nextSections = sections.filter((section) => section.projectId === nextProjectId)
              setSectionId(nextSections[0]?.id ?? '')
            }}
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm font-medium text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
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
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm font-medium text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          >
            {projectSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),180px,160px,auto]">
          <input
            value={dueInput}
            onChange={(event) => setDueInput(event.target.value)}
            placeholder="Due date: tomorrow, next Monday, or 2026-03-20"
            className={`min-h-12 rounded-[22px] border px-4 text-sm outline-none focus:ring-4 ${
              dueInput.trim().length > 0 && !resolvedDueDate
                ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-rose-100'
                : 'border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] text-[var(--text-primary)] focus:border-[color:var(--accent)] focus:ring-[var(--ring)]'
            }`}
          />

          <input
            type="date"
            value={resolvedDueDate ?? ''}
            onChange={(event) => setDueInput(event.target.value)}
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm font-medium text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as PriorityLevel)}
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          >
            <option value="P1">P1 urgent</option>
            <option value="P2">P2 high</option>
            <option value="P3">P3 medium</option>
            <option value="P4">P4 low</option>
          </select>

          <button
            type="button"
            onClick={submit}
            className="min-h-12 rounded-[22px] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
          >
            Add task
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {dueInput.trim().length > 0 && !resolvedDueDate ? (
              <p className="text-rose-600">
                That date could not be parsed. Try a phrase like &quot;tomorrow&quot; or a date like
                {' '}2026-03-20.
              </p>
            ) : resolvedDueDate ? (
              <p className="text-[var(--text-muted)]">
                This task will appear on {formatLongDateLabel(resolvedDueDate)}.
              </p>
            ) : (
              <p className="text-[var(--text-muted)]">Leave the due date blank if the task is unscheduled.</p>
            )}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
            Enter submits from the title field
          </p>
        </div>
      </div>
    </section>
  )
}
