export const PRIORITY_LEVELS = ['P1', 'P2', 'P3', 'P4'] as const
export const LABEL_COLORS = [
  'slate',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'sky',
  'blue',
  'indigo',
  'pink',
] as const
export const INBOX_PROJECT_ID = 'project-inbox'
export const INBOX_BACKLOG_SECTION_ID = 'section-inbox-backlog'
export const INBOX_IN_PROGRESS_SECTION_ID = 'section-inbox-in-progress'
export const INBOX_DONE_SECTION_ID = 'section-inbox-done'

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]
export type LabelColor = (typeof LABEL_COLORS)[number]
export type DueScope = 'all' | 'today' | 'upcoming' | 'overdue' | 'unscheduled'
export type AppView = 'project' | 'today' | 'upcoming' | 'calendar'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom'

export type Project = {
  id: string
  name: string
  color: string
  sectionIds: string[]
  collapsed: boolean
  isInbox: boolean
}

export type Section = {
  id: string
  projectId: string
  name: string
}

export type Label = {
  id: string
  name: string
  color: LabelColor
}

export type Attachment = {
  id: string
  name: string
  kind: 'file' | 'link'
  url: string
  mimeType: string | null
  size: number | null
  createdAt: string
}

export type TaskComment = {
  id: string
  body: string
  createdAt: string
}

export type ActivityEntry = {
  id: string
  type: 'created' | 'updated' | 'completed' | 'moved' | 'commented' | 'attachment' | 'timer'
  message: string
  createdAt: string
}

export type RecurrenceRule = {
  frequency: RecurrenceFrequency
  interval: number
  paused: boolean
}

export type Todo = {
  id: string
  title: string
  completed: boolean
  completedAt: string | null
  skippedAt: string | null
  createdAt: string
  updatedAt: string
  projectId: string
  sectionId: string
  top3Date: string | null
  rolledOverOn: string | null
  dueDate: string | null
  priority: PriorityLevel
  labelIds: string[]
  parentTaskId: string | null
  subtaskIds: string[]
  description: string
  attachments: Attachment[]
  comments: TaskComment[]
  activity: ActivityEntry[]
  estimateMinutes: number | null
  timerStartedAt: string | null
  trackedMinutes: number
  recurrence: RecurrenceRule | null
  recurringTaskId: string | null
}

export type RolloverItem = {
  id: string
  title: string
}

export type SavedFilter = {
  id: string
  name: string
  projectId: string | null
  labelIds: string[]
  priority: PriorityLevel | 'all'
  showCompleted: boolean
  dueScope: DueScope
}

export type FilterState = {
  projectId: string | null
  labelIds: string[]
  priority: PriorityLevel | 'all'
  showCompleted: boolean
  dueScope: DueScope
}

export type StoredTodoState = {
  version: number
  tasks: Todo[]
  projects: Project[]
  sections: Section[]
  labels: Label[]
  savedFilters: SavedFilter[]
  rolloverItems: RolloverItem[]
  lastOpenedDate: string
  dailyCapacityMinutes: number
}
