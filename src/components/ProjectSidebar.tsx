import { useState } from 'react'
import type { Project, Section } from '../types/todo'

type ProjectSidebarProps = {
  projects: Project[]
  sections: Section[]
  activeView: 'project' | 'today' | 'upcoming'
  activeProjectId: string
  todayCount: number
  upcomingCount: number
  onSelectView: (view: 'project' | 'today' | 'upcoming') => void
  onSelectProject: (projectId: string) => void
  onToggleProject: (projectId: string) => void
  onAddProject: (name: string) => void
  onAddSection: (projectId: string, name: string) => void
}

export function ProjectSidebar({
  projects,
  sections,
  activeView,
  activeProjectId,
  todayCount,
  upcomingCount,
  onSelectView,
  onSelectProject,
  onToggleProject,
  onAddProject,
  onAddSection,
}: ProjectSidebarProps) {
  const [projectName, setProjectName] = useState('')
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({})

  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Workspace</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-900">Projects</h2>
        <p className="mt-2 text-sm text-slate-500">Inbox stays ready for quick capture. Projects hold structure.</p>
      </div>

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={() => onSelectView('today')}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
            activeView === 'today' ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>Today view</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${activeView === 'today' ? 'bg-white/20' : 'bg-white text-slate-500'}`}>
            {todayCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectView('upcoming')}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
            activeView === 'upcoming' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>Upcoming</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${activeView === 'upcoming' ? 'bg-white/10' : 'bg-white text-slate-500'}`}>
            {upcomingCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectView('project')}
          className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
            activeView === 'project' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Projects
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {projects.map((project) => {
          const projectSections = sections.filter((section) => section.projectId === project.id)
          const draft = sectionDrafts[project.id] ?? ''

          return (
            <div
              key={project.id}
              className={`rounded-3xl border p-4 transition ${
                activeProjectId === project.id
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
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
                    style={{ backgroundColor: activeProjectId === project.id ? '#fde68a' : project.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{project.name}</p>
                    <p
                      className={`text-xs ${
                        activeProjectId === project.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {project.isInbox ? 'Default capture project' : `${projectSections.length} sections`}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleProject(project.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activeProjectId === project.id ? 'bg-white/10 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {project.collapsed ? 'Show' : 'Hide'}
                </button>
              </div>

              {!project.collapsed && (
                <div className="mt-4 space-y-2">
                  {projectSections.map((section) => (
                    <div
                      key={section.id}
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        activeProjectId === project.id ? 'bg-white/10 text-slate-100' : 'bg-white text-slate-600'
                      }`}
                    >
                      {section.name}
                    </div>
                  ))}
                  {!project.isInbox && (
                    <div className="flex gap-2">
                      <input
                        value={draft}
                        onChange={(event) =>
                          setSectionDrafts((current) => ({
                            ...current,
                            [project.id]: event.target.value,
                          }))
                        }
                        placeholder="New section"
                        className={`min-h-11 flex-1 rounded-2xl border px-3 text-sm outline-none transition ${
                          activeProjectId === project.id
                            ? 'border-white/15 bg-white/10 text-white placeholder:text-slate-400'
                            : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                        }`}
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
                        className={`rounded-2xl px-4 text-sm font-semibold ${
                          activeProjectId === project.id
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <label htmlFor="project-name" className="text-sm font-semibold text-slate-700">
          Create project
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
            placeholder="Campaign launch"
            className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => {
              onAddProject(projectName)
              setProjectName('')
            }}
            className="rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Create
          </button>
        </div>
      </div>
    </aside>
  )
}
