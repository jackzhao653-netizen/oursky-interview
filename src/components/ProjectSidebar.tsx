import { useState } from 'react'
import type { AppView, Project, Section } from '../types/todo'

type ProjectSidebarProps = {
  projects: Project[]
  sections: Section[]
  activeView: AppView
  activeProjectId: string
  todayCount: number
  upcomingCount: number
  calendarCount: number
  projectTaskCounts: Record<string, number>
  onSelectView: (view: AppView) => void
  onSelectProject: (projectId: string) => void
  onToggleProject: (projectId: string) => void
  onAddProject: (name: string) => void
  onAddSection: (projectId: string, name: string) => void
}

const NAV_ITEMS: Array<{
  view: AppView
  label: string
  description: string
}> = [
  {
    view: 'project',
    label: 'Project workflow board',
    description: 'Organize work by project and workflow stage.',
  },
  {
    view: 'today',
    label: "Today's scheduled tasks",
    description: 'See what is due right now.',
  },
  {
    view: 'upcoming',
    label: 'Next 7 days',
    description: 'Review upcoming commitments.',
  },
  {
    view: 'calendar',
    label: 'Calendar planner',
    description: 'Browse the month and each scheduled day.',
  },
]

export function ProjectSidebar({
  projects,
  sections,
  activeView,
  activeProjectId,
  todayCount,
  upcomingCount,
  calendarCount,
  projectTaskCounts,
  onSelectView,
  onSelectProject,
  onToggleProject,
  onAddProject,
  onAddSection,
}: ProjectSidebarProps) {
  const [projectName, setProjectName] = useState('')
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({})

  const countByView: Record<AppView, number | null> = {
    project: projectTaskCounts[activeProjectId] ?? 0,
    today: todayCount,
    upcoming: upcomingCount,
    calendar: calendarCount,
  }

  return (
    <aside className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-panel)] backdrop-blur sm:p-6">
      <div className="border-b border-[color:var(--border-soft)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Navigation
        </p>
        <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)]">
          Choose the workspace you need
        </h2>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Switch between project planning, scheduled work, the next seven days, and the calendar.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onSelectView(item.view)}
              className={`flex w-full items-start justify-between gap-3 rounded-[24px] border px-4 py-3 text-left ${
                isActive
                  ? 'border-transparent bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={`mt-1 text-xs ${isActive ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {item.description}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                }`}
              >
                {countByView[item.view]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-t border-[color:var(--border-soft)] pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-subtle)]">
              Projects
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              Project list and workflow stages
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {projects.map((project) => {
            const projectSections = sections.filter((section) => section.projectId === project.id)
            const draft = sectionDrafts[project.id] ?? ''
            const isActive = activeProjectId === project.id

            return (
              <div
                key={project.id}
                className={`rounded-[28px] border p-4 ${
                  isActive
                    ? 'border-transparent bg-[var(--bg-muted-strong)]'
                    : 'border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {project.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {projectTaskCounts[project.id] ?? 0} tasks
                        {project.isInbox ? ' • default capture project' : ` • ${projectSections.length} workflow stages`}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleProject(project.id)}
                    className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    {project.collapsed ? 'Show stages' : 'Hide stages'}
                  </button>
                </div>

                {!project.collapsed ? (
                  <div className="mt-4 space-y-2">
                    {projectSections.map((section) => (
                      <div
                        key={section.id}
                        className="rounded-[20px] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]"
                      >
                        {section.name}
                      </div>
                    ))}
                    {!project.isInbox ? (
                      <div className="flex gap-2 pt-1">
                        <input
                          value={draft}
                          onChange={(event) =>
                            setSectionDrafts((current) => ({
                              ...current,
                              [project.id]: event.target.value,
                            }))
                          }
                          placeholder="New workflow stage"
                          className="min-h-11 flex-1 rounded-[20px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onAddSection(project.id, draft)
                            setSectionDrafts((current) => ({
                              ...current,
                              [project.id]: '',
                            }))
                          }}
                          className="rounded-[20px] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
                        >
                          Add stage
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-dashed border-[color:var(--border-strong)] bg-[var(--bg-inset)] p-4">
        <label htmlFor="project-name" className="text-sm font-semibold text-[var(--text-primary)]">
          Create a new project
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onAddProject(projectName)
                setProjectName('')
              }
            }}
            placeholder="Example: Website refresh"
            className="min-h-11 flex-1 rounded-[20px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />
          <button
            type="button"
            onClick={() => {
              onAddProject(projectName)
              setProjectName('')
            }}
            className="rounded-[20px] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
          >
            Create project
          </button>
        </div>
      </div>
    </aside>
  )
}
