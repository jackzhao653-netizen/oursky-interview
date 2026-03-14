import { create } from 'zustand'
import {
  INBOX_BACKLOG_SECTION_ID,
  INBOX_PROJECT_ID,
  type AppView,
  type FilterState,
  type LabelColor,
  type PriorityLevel,
  type Project,
  type RolloverItem,
  type SavedFilter,
  type Section,
  type StoredTodoState,
  type Todo,
} from '../types/todo'
import {
  clearLegacyLocalStorageState,
  createDefaultStoredState,
  loadLegacyLocalStorageState,
  loadStoredState,
  saveStoredState,
} from '../utils/storage'
import { getTodayKey } from '../utils/date'

type AddTaskInput = {
  title: string
  projectId?: string
  sectionId?: string
  dueDate?: string | null
  priority?: PriorityLevel
}

type TaskStore = StoredTodoState & {
  isHydrated: boolean
  isHydrating: boolean
  limitMessage: string
  activeView: AppView
  activeProjectId: string
  activeSectionId: string | null
  selectedTaskId: string | null
  filters: FilterState
  activeSavedFilterId: string | null
  hydrate: () => Promise<void>
  addTask: (input: AddTaskInput) => boolean
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  toggleTop3: (id: string) => void
  restoreRollover: (id: string) => void
  dismissRollover: (id: string) => void
  restoreAllRollovers: () => void
  addProject: (name: string) => void
  addSection: (projectId: string, name: string) => void
  toggleProjectCollapsed: (projectId: string) => void
  setActiveProject: (projectId: string) => void
  setActiveView: (view: AppView) => void
  selectTask: (taskId: string | null) => void
  addLabel: (name: string, color: LabelColor) => void
  toggleTaskLabel: (taskId: string, labelId: string) => void
  setFilters: (updates: Partial<FilterState>) => void
  resetFilters: () => void
  saveCurrentFilter: (name: string) => void
  applySavedFilter: (filterId: string | null) => void
  deleteSavedFilter: (filterId: string) => void
  updateTask: (
    taskId: string,
    updates: Partial<Todo>,
    options?: { activityMessage?: string; activityType?: Todo['activity'][number]['type'] },
  ) => void
  clearLimitMessage: () => void
}

const PROJECT_COLORS = ['#2563eb', '#f97316', '#14b8a6', '#ec4899', '#7c3aed', '#16a34a']

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createFilterState = (): FilterState => ({
  projectId: null,
  labelIds: [],
  priority: 'all',
  showCompleted: true,
  dueScope: 'all',
})

const createDefaultState = () => {
  const today = getTodayKey()
  const persisted = createDefaultStoredState(today)

  return {
    ...persisted,
    isHydrated: false,
    isHydrating: false,
    limitMessage: '',
    activeView: 'project' as AppView,
    activeProjectId: INBOX_PROJECT_ID,
    activeSectionId: null,
    selectedTaskId: null,
    filters: createFilterState(),
    activeSavedFilterId: null,
  }
}

function appendActivity(task: Todo, message: string, type: Todo['activity'][number]['type']) {
  const timestamp = new Date().toISOString()
  return {
    ...task,
    updatedAt: timestamp,
    activity: [
      {
        id: createId(),
        type,
        message,
        createdAt: timestamp,
      },
      ...task.activity,
    ],
  }
}

function sortTasks(tasks: Todo[]) {
  const priorityWeight: Record<PriorityLevel, number> = {
    P1: 0,
    P2: 1,
    P3: 2,
    P4: 3,
  }

  return [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed)
    }

    if (priorityWeight[left.priority] !== priorityWeight[right.priority]) {
      return priorityWeight[left.priority] - priorityWeight[right.priority]
    }

    if (left.dueDate !== right.dueDate) {
      if (!left.dueDate) {
        return 1
      }

      if (!right.dueDate) {
        return -1
      }

      return left.dueDate.localeCompare(right.dueDate)
    }

    return right.createdAt.localeCompare(left.createdAt)
  })
}

function normalizeProject(project: Project, sections: Section[]) {
  const sectionIds = sections
    .filter((section) => section.projectId === project.id)
    .map((section) => section.id)

  return {
    ...project,
    sectionIds,
  }
}

function rolloverTop3(state: StoredTodoState, today: string): StoredTodoState {
  if (state.lastOpenedDate === today) {
    return state
  }

  const rolloverItems: RolloverItem[] = [...state.rolloverItems]
  const tasks = state.tasks.map((task) => {
    if (task.top3Date === state.lastOpenedDate && !task.completed) {
      rolloverItems.unshift({ id: task.id, title: task.title })
      return {
        ...task,
        top3Date: null,
      }
    }

    return task
  })

  return {
    ...state,
    tasks,
    rolloverItems,
    lastOpenedDate: today,
  }
}

function createProjectSections(projectId: string) {
  const backlogId = `${projectId}-backlog`
  const progressId = `${projectId}-in-progress`
  const doneId = `${projectId}-done`

  return [
    { id: backlogId, projectId, name: 'Backlog' },
    { id: progressId, projectId, name: 'In Progress' },
    { id: doneId, projectId, name: 'Done' },
  ]
}

function getPersistedState(state: TaskStore): StoredTodoState {
  return {
    version: state.version,
    tasks: state.tasks,
    projects: state.projects,
    sections: state.sections,
    labels: state.labels,
    savedFilters: state.savedFilters,
    rolloverItems: state.rolloverItems,
    lastOpenedDate: state.lastOpenedDate,
    dailyCapacityMinutes: state.dailyCapacityMinutes,
  }
}

function getVisibleProjectId(projects: Project[], activeProjectId: string) {
  return projects.some((project) => project.id === activeProjectId) ? activeProjectId : INBOX_PROJECT_ID
}

export const useTaskStore = create<TaskStore>((set, get) => {
  const persist = () => {
    void saveStoredState(getPersistedState(get()))
  }

  return {
    ...createDefaultState(),
    hydrate: async () => {
      if (get().isHydrated || get().isHydrating) {
        return
      }

      set({ isHydrating: true })
      const today = getTodayKey()

      try {
        const stored = (await loadStoredState()) ?? loadLegacyLocalStorageState(today)
        const base = stored ?? createDefaultStoredState(today)
        const normalizedProjects = base.projects.map((project) => normalizeProject(project, base.sections))
        const rolled = rolloverTop3({ ...base, projects: normalizedProjects }, today)
        set({
          ...rolled,
          tasks: sortTasks(rolled.tasks),
          activeProjectId: getVisibleProjectId(rolled.projects, get().activeProjectId),
          isHydrated: true,
          isHydrating: false,
        })

        if (!stored) {
          clearLegacyLocalStorageState()
        }

        await saveStoredState(getPersistedState(get()))
      } catch (error) {
        console.error('Failed to hydrate task manager state', error)
        set({
          ...createDefaultStoredState(today),
          isHydrated: true,
          isHydrating: false,
        })
      }
    },
    addTask: ({ title, projectId = get().activeProjectId, sectionId, dueDate = null, priority = 'P3' }) => {
      const trimmedTitle = title.trim()

      if (!trimmedTitle) {
        return false
      }

      const targetProject = get().projects.find((project) => project.id === projectId) ?? get().projects[0]
      const projectSections = get().sections.filter((candidate) => candidate.projectId === targetProject.id)
      const targetSection =
        projectSections.find((candidate) => candidate.id === sectionId) ??
        projectSections[0] ??
        get().sections.find((candidate) => candidate.id === INBOX_BACKLOG_SECTION_ID)

      if (!targetSection) {
        return false
      }

      const timestamp = new Date().toISOString()
      const task: Todo = {
        id: createId(),
        title: trimmedTitle,
        completed: false,
        completedAt: null,
        skippedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        projectId: targetProject.id,
        sectionId: targetSection.id,
        top3Date: null,
        rolledOverOn: null,
        dueDate,
        priority,
        labelIds: [],
        parentTaskId: null,
        subtaskIds: [],
        description: '',
        attachments: [],
        comments: [],
        activity: [
          {
            id: createId(),
            type: 'created',
            message: `Task created in ${targetProject.name} / ${targetSection.name}`,
            createdAt: timestamp,
          },
        ],
        estimateMinutes: null,
        timerStartedAt: null,
        trackedMinutes: 0,
        recurrence: null,
        recurringTaskId: null,
      }

      set((state) => ({
        tasks: sortTasks([task, ...state.tasks]),
        selectedTaskId: task.id,
      }))
      persist()
      return true
    },
    toggleTask: (id) => {
      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((task) => {
            if (task.id !== id) {
              return task
            }

            return appendActivity(
              {
                ...task,
                completed: !task.completed,
                completedAt: task.completed ? null : new Date().toISOString(),
              },
              task.completed ? 'Marked incomplete' : 'Marked complete',
              'completed',
            )
          }),
        ),
      }))
      persist()
    },
    deleteTask: (id) => {
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id && task.parentTaskId !== id),
        rolloverItems: state.rolloverItems.filter((item) => item.id !== id),
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
      }))
      persist()
    },
    toggleTop3: (id) => {
      const today = getTodayKey()
      const task = get().tasks.find((candidate) => candidate.id === id)
      if (!task) {
        return
      }

      if (task.top3Date === today) {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((candidate) =>
              candidate.id === id
                ? appendActivity(
                    {
                      ...candidate,
                      top3Date: null,
                      rolledOverOn: null,
                    },
                    'Removed from Today Top 3',
                    'updated',
                  )
                : candidate,
            ),
          ),
          rolloverItems: state.rolloverItems.filter((item) => item.id !== id),
        }))
        persist()
        return
      }

      const selectedCount = get().tasks.filter((candidate) => candidate.top3Date === today).length
      if (selectedCount >= 3) {
        set({ limitMessage: 'You already picked 3 priorities for today.' })
        return
      }

      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((candidate) =>
            candidate.id === id
              ? appendActivity(
                  {
                    ...candidate,
                    top3Date: today,
                  },
                  'Added to Today Top 3',
                  'updated',
                )
              : candidate,
          ),
        ),
        rolloverItems: state.rolloverItems.filter((item) => item.id !== id),
      }))
      persist()
    },
    restoreRollover: (id) => {
      const today = getTodayKey()
      const selectedCount = get().tasks.filter((candidate) => candidate.top3Date === today).length

      if (selectedCount >= 3) {
        set({ limitMessage: 'You already picked 3 priorities for today.' })
        return
      }

      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((task) =>
            task.id === id
              ? appendActivity(
                  {
                    ...task,
                    top3Date: today,
                    rolledOverOn: today,
                  },
                  'Restored from rollover into Today Top 3',
                  'updated',
                )
              : task,
          ),
        ),
        rolloverItems: state.rolloverItems.filter((item) => item.id !== id),
      }))
      persist()
    },
    dismissRollover: (id) => {
      set((state) => ({
        rolloverItems: state.rolloverItems.filter((item) => item.id !== id),
      }))
      persist()
    },
    restoreAllRollovers: () => {
      const today = getTodayKey()
      const selectedCount = get().tasks.filter((candidate) => candidate.top3Date === today).length
      const availableSlots = 3 - selectedCount

      if (availableSlots <= 0) {
        set({ limitMessage: 'You already picked 3 priorities for today.' })
        return
      }

      const idsToRestore = get()
        .rolloverItems.slice(0, availableSlots)
        .map((item) => item.id)

      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((task) =>
            idsToRestore.includes(task.id)
              ? appendActivity(
                  {
                    ...task,
                    top3Date: today,
                    rolledOverOn: today,
                  },
                  'Restored from rollover into Today Top 3',
                  'updated',
                )
              : task,
          ),
        ),
        rolloverItems: state.rolloverItems.filter((item) => !idsToRestore.includes(item.id)),
        limitMessage:
          state.rolloverItems.length > availableSlots
            ? 'Only enough room to restore the remaining priority slots.'
            : state.limitMessage,
      }))
      persist()
    },
    addProject: (name) => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return
      }

      const projectId = createId()
      const sections = createProjectSections(projectId)
      const color = PROJECT_COLORS[get().projects.length % PROJECT_COLORS.length]
      const project: Project = {
        id: projectId,
        name: trimmedName,
        color,
        sectionIds: sections.map((section) => section.id),
        collapsed: false,
        isInbox: false,
      }

      set((state) => ({
        projects: [...state.projects, project],
        sections: [...state.sections, ...sections],
        activeProjectId: projectId,
        activeView: 'project',
      }))
      persist()
    },
    addSection: (projectId, name) => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return
      }

      const section: Section = {
        id: createId(),
        projectId,
        name: trimmedName,
      }

      set((state) => ({
        sections: [...state.sections, section],
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                sectionIds: [...project.sectionIds, section.id],
              }
            : project,
        ),
      }))
      persist()
    },
    toggleProjectCollapsed: (projectId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, collapsed: !project.collapsed } : project,
        ),
      }))
      persist()
    },
    setActiveProject: (projectId) => {
      set({
        activeProjectId: projectId,
        activeView: 'project',
      })
    },
    setActiveView: (view) => {
      set({ activeView: view })
    },
    selectTask: (taskId) => {
      set({ selectedTaskId: taskId })
    },
    addLabel: (name, color) => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return
      }

      set((state) => ({
        labels: [...state.labels, { id: createId(), name: trimmedName, color }],
      }))
      persist()
    },
    toggleTaskLabel: (taskId, labelId) => {
      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((task) => {
            if (task.id !== taskId) {
              return task
            }

            const labelIds = task.labelIds.includes(labelId)
              ? task.labelIds.filter((existingId) => existingId !== labelId)
              : [...task.labelIds, labelId]

            return appendActivity(
              {
                ...task,
                labelIds,
              },
              'Updated task labels',
              'updated',
            )
          }),
        ),
      }))
      persist()
    },
    setFilters: (updates) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...updates,
        },
        activeSavedFilterId: null,
      }))
    },
    resetFilters: () => {
      set({
        filters: createFilterState(),
        activeSavedFilterId: null,
      })
    },
    saveCurrentFilter: (name) => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return
      }

      const nextFilter: SavedFilter = {
        id: createId(),
        name: trimmedName,
        ...get().filters,
      }

      set((state) => ({
        savedFilters: [...state.savedFilters, nextFilter],
        activeSavedFilterId: nextFilter.id,
      }))
      persist()
    },
    applySavedFilter: (filterId) => {
      if (!filterId) {
        set({
          filters: createFilterState(),
          activeSavedFilterId: null,
        })
        return
      }

      const nextFilter = get().savedFilters.find((filter) => filter.id === filterId)
      if (!nextFilter) {
        return
      }

      set({
        filters: {
          projectId: nextFilter.projectId,
          labelIds: nextFilter.labelIds,
          priority: nextFilter.priority,
          showCompleted: nextFilter.showCompleted,
          dueScope: nextFilter.dueScope,
        },
        activeSavedFilterId: filterId,
      })
    },
    deleteSavedFilter: (filterId) => {
      set((state) => ({
        savedFilters: state.savedFilters.filter((filter) => filter.id !== filterId),
        activeSavedFilterId: state.activeSavedFilterId === filterId ? null : state.activeSavedFilterId,
      }))
      persist()
    },
    updateTask: (taskId, updates, options) => {
      set((state) => ({
        tasks: sortTasks(
          state.tasks.map((task) => {
            if (task.id !== taskId) {
              return task
            }

            const nextTask = {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }

            return options?.activityMessage
              ? appendActivity(
                  nextTask,
                  options.activityMessage,
                  options.activityType ?? 'updated',
                )
              : nextTask
          }),
        ),
      }))
      persist()
    },
    clearLimitMessage: () => {
      set({ limitMessage: '' })
    },
  }
})

export function selectTasksForProject(tasks: Todo[], projectId: string) {
  return tasks.filter((task) => task.projectId === projectId && task.parentTaskId === null)
}

export function selectTop3Tasks(tasks: Todo[], today: string) {
  return tasks.filter((task) => task.top3Date === today && task.parentTaskId === null)
}

export function selectTasksDueOn(tasks: Todo[], dateKey: string) {
  return tasks.filter(
    (task) => task.parentTaskId === null && task.dueDate === dateKey,
  )
}

export function selectUpcomingTasks(tasks: Todo[], today: string, days: number) {
  const todayTime = new Date(`${today}T00:00:00`).getTime()
  return tasks.filter((task) => {
    if (task.parentTaskId !== null || task.dueDate === null) {
      return false
    }

    const taskTime = new Date(`${task.dueDate}T00:00:00`).getTime()
    const delta = Math.round((taskTime - todayTime) / 86400000)
    return delta >= 1 && delta <= days
  })
}

export function filterVisibleTasks(tasks: Todo[], filters: FilterState) {
  return tasks.filter((task) => {
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false
    }

    if (!filters.showCompleted && task.completed) {
      return false
    }

    if (filters.labelIds.length > 0 && !filters.labelIds.every((labelId) => task.labelIds.includes(labelId))) {
      return false
    }

    if (filters.dueScope === 'unscheduled' && task.dueDate !== null) {
      return false
    }

    if (filters.dueScope !== 'all' && filters.dueScope !== 'unscheduled' && task.dueDate === null) {
      return false
    }

    return true
  })
}
