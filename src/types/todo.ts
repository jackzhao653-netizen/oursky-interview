export const PRIORITY_LEVELS = ["red", "yellow", "green", "white"] as const;
export const TODO_STATUSES = ["open", "done", "cancelled"] as const;
export const CATEGORY_OPTIONS = [
  "Product",
  "Client",
  "Studio",
  "Personal",
] as const;
export const TODO_KINDS = [
  "build",
  "review",
  "planning",
  "follow-up",
  "errand",
] as const;
export const TOP3_LIMIT = 3;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
export type TodoStatus = (typeof TODO_STATUSES)[number];
export type TodoCategory = (typeof CATEGORY_OPTIONS)[number];
export type TodoKind = (typeof TODO_KINDS)[number];
export type CalendarView = "day" | "week";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TodoEvent = {
  id: string;
  title: string;
  course: string;
  kind: string;
  date: string;
  start: string;
  end: string;
  location: string;
  notes: string;
  status: TodoStatus;
  priority: PriorityLevel;
  checklist: ChecklistItem[];
  top3Date: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
};

export type TodoEventFile = {
  version: number;
  events: TodoEvent[];
};

export type TodoFilters = {
  showOpen: boolean;
  showDone: boolean;
  showCancelled: boolean;
  hiddenCourses: string[];
  selectedPriorities: PriorityLevel[];
};
