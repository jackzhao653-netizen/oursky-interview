import { useEffect, useMemo, useState } from 'react'
import { CalendarBoard } from './components/CalendarBoard'
import { FilterPanel } from './components/FilterPanel'
import { ProjectBoard } from './components/ProjectBoard'
import { ProjectSidebar } from './components/ProjectSidebar'
import { ScheduleBoard } from './components/ScheduleBoard'
import { TaskComposer } from './components/TaskComposer'
import { TaskInspector } from './components/TaskInspector'
import { Top3Section } from './components/Top3Section'
import {
  filterVisibleTasks,
  selectTasksDueOn,
  selectTasksForProject,
  selectTop3Tasks,
  selectUpcomingTasks,
  useTaskStore,
} from './store/useTaskStore'
import { addDays, addMonths, getTodayKey } from './utils/date'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'oursky-ui-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  const hydrate = useTaskStore((state) => state.hydrate)
  const projects = useTaskStore((state) => state.projects)
  const sections = useTaskStore((state) => state.sections)
  const labels = useTaskStore((state) => state.labels)
  const filters = useTaskStore((state) => state.filters)
  const savedFilters = useTaskStore((state) => state.savedFilters)
  const activeSavedFilterId = useTaskStore((state) => state.activeSavedFilterId)
  const tasks = useTaskStore((state) => state.tasks)
  const rolloverItems = useTaskStore((state) => state.rolloverItems)
  const isLoaded = useTaskStore((state) => state.isHydrated)
  const limitMessage = useTaskStore((state) => state.limitMessage)
  const activeProjectId = useTaskStore((state) => state.activeProjectId)
  const activeView = useTaskStore((state) => state.activeView)
  const addTask = useTaskStore((state) => state.addTask)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const toggleTop3 = useTaskStore((state) => state.toggleTop3)
  const restoreRollover = useTaskStore((state) => state.restoreRollover)
  const dismissRollover = useTaskStore((state) => state.dismissRollover)
  const restoreAllRollovers = useTaskStore((state) => state.restoreAllRollovers)
  const addProject = useTaskStore((state) => state.addProject)
  const addSection = useTaskStore((state) => state.addSection)
  const toggleProjectCollapsed = useTaskStore((state) => state.toggleProjectCollapsed)
  const setActiveView = useTaskStore((state) => state.setActiveView)
  const setActiveProject = useTaskStore((state) => state.setActiveProject)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const addLabel = useTaskStore((state) => state.addLabel)
  const setFilters = useTaskStore((state) => state.setFilters)
  const resetFilters = useTaskStore((state) => state.resetFilters)
  const saveCurrentFilter = useTaskStore((state) => state.saveCurrentFilter)
  const applySavedFilter = useTaskStore((state) => state.applySavedFilter)
  const deleteSavedFilter = useTaskStore((state) => state.deleteSavedFilter)
  const updateTask = useTaskStore((state) => state.updateTask)
  const clearLimitMessage = useTaskStore((state) => state.clearLimitMessage)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!limitMessage) {
      return
    }

    const timer = window.setTimeout(() => clearLimitMessage(), 2500)
    return () => window.clearTimeout(timer)
  }, [clearLimitMessage, limitMessage])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const today = useMemo(() => getTodayKey(), [])
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(`${today}T00:00:00`))
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState(today)

  const filteredTasks = filterVisibleTasks(tasks, filters).filter((task) => {
    if (filters.dueScope === 'today') {
      return task.dueDate === today
    }

    if (filters.dueScope === 'upcoming') {
      return task.dueDate !== null && task.dueDate > today
    }

    if (filters.dueScope === 'overdue') {
      return task.dueDate !== null && task.dueDate < today
    }

    return true
  })

  const visibleProjectId = filters.projectId ?? activeProjectId
  const activeProject = projects.find((project) => project.id === visibleProjectId) ?? null
  const projectSections = sections.filter((section) => section.projectId === visibleProjectId)
  const projectTasks = selectTasksForProject(filteredTasks, visibleProjectId)
  const top3Todos = selectTop3Tasks(tasks, today)
  const suggestedP1Todos = tasks
    .filter(
      (task) =>
        task.parentTaskId === null &&
        task.priority === 'P1' &&
        !task.completed &&
        task.top3Date !== today,
    )
    .slice(0, 3)
  const todayTasks = selectTasksDueOn(filteredTasks, today)
  const upcomingTasks = selectUpcomingTasks(filteredTasks, today, 7)
  const priorityIds = new Set(top3Todos.map((todo) => todo.id))
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const upcomingGroups = Array.from({ length: 7 }, (_, offset) => {
    const dateKey = getTodayKey(addDays(new Date(`${today}T00:00:00`), offset + 1))
    return {
      title: offset === 0 ? 'Tomorrow' : `In ${offset + 1} days`,
      dateKey,
      tasks: upcomingTasks.filter((task) => task.dueDate === dateKey),
    }
  }).filter((group) => group.tasks.length > 0)

  const rootTasks = tasks.filter((task) => task.parentTaskId === null)
  const openRootTasks = rootTasks.filter((task) => !task.completed)
  const projectTaskCounts = projects.reduce<Record<string, number>>((accumulator, project) => {
    accumulator[project.id] = rootTasks.filter((task) => task.projectId === project.id).length
    return accumulator
  }, {})
  const calendarCount = filteredTasks.filter((task) => {
    if (task.parentTaskId !== null || !task.dueDate) {
      return false
    }

    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getTime()
    const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getTime()
    const dueTime = new Date(`${task.dueDate}T00:00:00`).getTime()
    return dueTime >= monthStart && dueTime <= monthEnd
  }).length
  const overdueCount = openRootTasks.filter((task) => task.dueDate !== null && task.dueDate < today).length

  const headerStats = [
    { label: 'Open tasks', value: openRootTasks.length },
    { label: 'Due today', value: todayTasks.length },
    { label: 'Next 7 days', value: upcomingTasks.length },
    { label: "Today's focus", value: `${top3Todos.length}/3` },
  ]

  const viewSummary =
    activeView === 'project'
      ? 'Project workflow board'
      : activeView === 'today'
        ? "Today's scheduled tasks"
        : activeView === 'upcoming'
          ? 'Next 7 days'
          : 'Calendar planner'

  const handleChangeMonth = (offset: number) => {
    const nextMonth = addMonths(calendarMonth, offset)
    const normalizedMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
    setCalendarMonth(normalizedMonth)
    setSelectedCalendarDateKey(getTodayKey(normalizedMonth))
  }

  const handleSelectCalendarDate = (dateKey: string) => {
    setSelectedCalendarDateKey(dateKey)
    const nextDate = new Date(`${dateKey}T00:00:00`)
    if (
      nextDate.getFullYear() !== calendarMonth.getFullYear() ||
      nextDate.getMonth() !== calendarMonth.getMonth()
    ) {
      setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
    }
  }

  const handleJumpToToday = () => {
    const todayDate = new Date(`${today}T00:00:00`)
    setCalendarMonth(todayDate)
    setSelectedCalendarDateKey(today)
  }

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1520px] space-y-6">
        <header className="overflow-hidden rounded-[40px] border border-[color:var(--border-soft)] bg-[var(--bg-hero)] px-6 py-7 shadow-[var(--shadow-panel)] backdrop-blur sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
                Oursky planning workspace
              </div>
              <h1 className="font-display mt-4 text-4xl leading-none text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                Clean task planning across projects, schedules, and the calendar.
              </h1>
              <p className="mt-4 max-w-3xl text-base text-[var(--text-muted)] sm:text-lg">
                Capture work once, organize it by project and workflow stage, pick today&apos;s focus tasks,
                and review the month without losing context.
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-4">
              <div className="rounded-[28px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  Current workspace
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{viewSummary}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {activeProject ? `Active project: ${activeProject.name}` : 'No project selected'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
                className="flex items-center justify-between rounded-[28px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 py-4 text-left hover:bg-[var(--bg-muted)]"
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    Theme
                  </span>
                  <span className="mt-2 block text-base font-semibold text-[var(--text-primary)]">
                    {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  </span>
                </span>
                <span className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-sm font-semibold text-[var(--text-secondary)]">
                  {theme === 'light' ? 'Light' : 'Dark'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {headerStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--bg-elevated-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]">
              Filters affect project, schedule, and calendar views
            </span>
            <span className="rounded-full bg-[var(--bg-elevated-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]">
              {overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}
            </span>
            <span className="rounded-full bg-[var(--bg-elevated-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]">
              Calendar shows scheduled tasks by day
            </span>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr),360px]">
          <div className="self-start xl:sticky xl:top-6">
            <ProjectSidebar
              projects={projects}
              sections={sections}
              activeView={activeView}
              activeProjectId={activeProjectId}
              todayCount={todayTasks.length}
              upcomingCount={upcomingTasks.length}
              calendarCount={calendarCount}
              projectTaskCounts={projectTaskCounts}
              onSelectView={setActiveView}
              onSelectProject={setActiveProject}
              onToggleProject={toggleProjectCollapsed}
              onAddProject={addProject}
              onAddSection={addSection}
            />
          </div>

          <div className="space-y-6">
            <TaskComposer
              key={activeProjectId}
              projects={projects}
              sections={sections}
              activeProjectId={activeProjectId}
              onAdd={addTask}
            />

            {!isLoaded ? (
              <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
                Loading your workspace...
              </div>
            ) : activeView === 'today' ? (
              <ScheduleBoard
                title="Today's scheduled tasks"
                subtitle="Everything due today is collected here so you can see commitments separately from the rest of the backlog."
                groups={[{ title: 'Due today', dateKey: today, tasks: todayTasks }]}
                projects={projects}
                sections={sections}
                labels={labels}
                priorityIds={priorityIds}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleTop3={toggleTop3}
                onSelect={selectTask}
              />
            ) : activeView === 'upcoming' ? (
              <ScheduleBoard
                title="Next 7 days"
                subtitle="Review the next week of work so upcoming commitments do not surprise you."
                groups={
                  upcomingGroups.length > 0
                    ? upcomingGroups
                    : [{ title: 'Next 7 days', tasks: [] }]
                }
                projects={projects}
                sections={sections}
                labels={labels}
                priorityIds={priorityIds}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleTop3={toggleTop3}
                onSelect={selectTask}
              />
            ) : activeView === 'calendar' ? (
              <CalendarBoard
                month={calendarMonth}
                selectedDateKey={selectedCalendarDateKey}
                todayKey={today}
                tasks={filteredTasks}
                projects={projects}
                sections={sections}
                labels={labels}
                priorityIds={priorityIds}
                onSelectDate={handleSelectCalendarDate}
                onChangeMonth={handleChangeMonth}
                onJumpToToday={handleJumpToToday}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleTop3={toggleTop3}
                onSelectTask={selectTask}
              />
            ) : (
              <ProjectBoard
                project={activeProject}
                sections={projectSections}
                tasks={projectTasks}
                labels={labels}
                priorityIds={priorityIds}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleTop3={toggleTop3}
                onSelect={selectTask}
              />
            )}
          </div>

          <div className="space-y-6 self-start xl:sticky xl:top-6">
            <Top3Section
              todos={top3Todos}
              suggestedTodos={suggestedP1Todos}
              rolloverItems={rolloverItems}
              limitMessage={limitMessage}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onToggleTop3={toggleTop3}
              onRestore={restoreRollover}
              onDismissRollover={dismissRollover}
              onRestoreAll={restoreAllRollovers}
            />

            <FilterPanel
              projects={projects}
              labels={labels}
              filters={filters}
              savedFilters={savedFilters}
              activeSavedFilterId={activeSavedFilterId}
              onSetFilters={setFilters}
              onResetFilters={resetFilters}
              onSaveCurrentFilter={saveCurrentFilter}
              onApplySavedFilter={applySavedFilter}
              onDeleteSavedFilter={deleteSavedFilter}
              onAddLabel={addLabel}
            />

            <TaskInspector
              task={selectedTask}
              projects={projects}
              sections={sections}
              labels={labels}
              onSelectTask={selectTask}
              onUpdateTask={updateTask}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
