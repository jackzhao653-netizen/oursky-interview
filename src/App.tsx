import { useEffect, useMemo } from 'react'
import { FilterPanel } from './components/FilterPanel'
import { ProjectBoard } from './components/ProjectBoard'
import { ScheduleBoard } from './components/ScheduleBoard'
import { ProjectSidebar } from './components/ProjectSidebar'
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
import { addDays, getTodayKey } from './utils/date'

function App() {
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

  const today = useMemo(() => getTodayKey(), [])
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
  const projectSections = sections.filter((section) => section.projectId === visibleProjectId)
  const projectTasks = selectTasksForProject(filteredTasks, filters.projectId ?? activeProjectId)
  const top3Todos = selectTop3Tasks(tasks, today)
  const suggestedP1Todos = tasks
    .filter((task) => task.parentTaskId === null && task.priority === 'P1' && !task.completed && task.top3Date !== today)
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

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fffef5_0%,#f6fbff_42%,#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[36px] border border-white/60 bg-white/75 px-6 py-7 shadow-[0_35px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur sm:px-8">
          <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            Oursky task manager evolution
          </div>
          <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Daily Top-3, now with real structure.
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-600">
                Projects and sections turn the original Daily Top-3 ritual into a broader task manager without losing the focused daily planning loop.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-[24px] bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Projects</p>
                <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
              </div>
              <div className="rounded-[24px] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sections</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{projectSections.length}</p>
              </div>
              <div className="rounded-[24px] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top 3</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{top3Todos.length}/3</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[300px,minmax(0,1fr),320px]">
          <ProjectSidebar
            projects={projects}
            sections={sections}
            activeView={activeView}
            activeProjectId={activeProjectId}
            todayCount={todayTasks.length}
            upcomingCount={upcomingTasks.length}
            onSelectView={setActiveView}
            onSelectProject={setActiveProject}
            onToggleProject={toggleProjectCollapsed}
            onAddProject={addProject}
            onAddSection={addSection}
          />

          <div className="space-y-6">
            <TaskComposer
              key={activeProjectId}
              projects={projects}
              sections={sections}
              activeProjectId={activeProjectId}
              onAdd={addTask}
            />

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

            {!isLoaded ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                Loading your tasks...
              </div>
            ) : activeView === 'today' ? (
              <ScheduleBoard
                title="Today view"
                subtitle="Scheduled work for today stays separate from your Top-3 focus picks."
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
                title="Upcoming"
                subtitle="The next seven days of scheduled work."
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
            ) : (
              <ProjectBoard
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
    </main>
  )
}

export default App
