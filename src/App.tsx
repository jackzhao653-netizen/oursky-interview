import {
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ACTIVITY_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_LEVELS,
  RECURRENCE_OPTIONS,
  TOP3_LIMIT,
  type ChecklistItem,
  type PriorityLevel,
  type ResolvedTodoEvent,
  type TodoEvent,
  type TodoEventFile,
  type TodoFilters,
} from "./types/todo";
import {
  addDays,
  addMonths,
  compareDateKeys,
  fromDateKey,
  getFullDateLabel,
  getMonthLabel,
  getNextOccurrenceOnOrAfter,
  maxDateKey,
  minDateKey,
  getRelativeDateLabel,
  getShortDateLabel,
  getTodayKey,
  getWeekLabel,
  getWeekdayLabel,
  startOfWeek,
} from "./utils/date";
import {
  createEmptyTodoEvent,
  loadEventFile,
  PERSISTENCE_NOTICE_EVENT,
  resolveEventsInRange,
  saveEventFile,
  startPersistenceSync,
  sortEvents,
} from "./utils/storage";

type ThemeMode = "dark" | "light";

type ModalState = {
  open: boolean;
  eventId: string | null;
};

type QuickAddState = {
  title: string;
  date: string;
  category: string;
  priority: PriorityLevel;
};

type WeekTooltipState = {
  event: ResolvedTodoEvent;
  dayKey: string;
  side: "left" | "right";
  top: number;
};

const DEFAULT_FILTERS: TodoFilters = {
  showOpen: true,
  showDone: false,
  showCancelled: false,
  hiddenCategories: [],
  selectedPriorities: [...PRIORITY_LEVELS],
};

const THEME_STORAGE_KEY = "oursky-todo-theme";

const CATEGORY_META: Record<
  string,
  { accent: string; soft: string; border: string }
> = {
  Product: {
    accent: "#fbbf24",
    soft: "rgba(251,191,36,0.14)",
    border: "rgba(251,191,36,0.35)",
  },
  Client: {
    accent: "#60a5fa",
    soft: "rgba(96,165,250,0.14)",
    border: "rgba(96,165,250,0.35)",
  },
  Studio: {
    accent: "#34d399",
    soft: "rgba(52,211,153,0.14)",
    border: "rgba(52,211,153,0.35)",
  },
  Personal: {
    accent: "#fb7185",
    soft: "rgba(251,113,133,0.14)",
    border: "rgba(251,113,133,0.35)",
  },
};

const MONTH_LABELS = Array.from({ length: 12 }, (_, monthIndex) =>
  new Intl.DateTimeFormat(undefined, { month: "short" }).format(
    new Date(2026, monthIndex, 1),
  ),
);

function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] ?? {
      accent: "#a78bfa",
      soft: "rgba(167,139,250,0.14)",
      border: "rgba(167,139,250,0.35)",
    }
  );
}

const PRIORITY_META: Record<
  PriorityLevel,
  {
    label: string;
    description: string;
    color: string;
    soft: string;
    border: string;
  }
> = {
  red: {
    label: "Red",
    description: "Urgent/Critical",
    color: "var(--priority-red)",
    soft: "var(--priority-red-soft)",
    border: "var(--priority-red-border)",
  },
  yellow: {
    label: "Yellow",
    description: "Important",
    color: "var(--priority-yellow)",
    soft: "var(--priority-yellow-soft)",
    border: "var(--priority-yellow-border)",
  },
  green: {
    label: "Green",
    description: "Normal",
    color: "var(--priority-green)",
    soft: "var(--priority-green-soft)",
    border: "var(--priority-green-border)",
  },
  white: {
    label: "White",
    description: "Low priority",
    color: "var(--priority-white)",
    soft: "var(--priority-white-soft)",
    border: "var(--priority-white-border)",
  },
};

function getPriorityMeta(priority: PriorityLevel) {
  return PRIORITY_META[priority];
}

type PriorityBadgeProps = {
  priority: PriorityLevel;
  showDescription?: boolean;
  compact?: boolean;
  dotOnly?: boolean;
};

function PriorityBadge({
  priority,
  showDescription = false,
  compact = false,
  dotOnly = false,
}: PriorityBadgeProps) {
  const meta = getPriorityMeta(priority);

  return (
    <span
      className={`priority-mark ${compact ? "is-compact" : ""}`}
      style={
        {
          "--priority-color": meta.color,
          "--priority-soft": meta.soft,
          "--priority-border": meta.border,
        } as CSSProperties
      }
    >
      <span className="priority-dot" aria-hidden="true" />
      {dotOnly ? null : (
        <span className="priority-mark__copy">
          <span className="priority-mark__label">{meta.label}</span>
          {showDescription ? (
            <span className="priority-mark__description">{meta.description}</span>
          ) : null}
        </span>
      )}
    </span>
  );
}

function getChecklistSummary(checklist: ChecklistItem[]) {
  const completed = checklist.filter((item) => item.done).length;
  return `${completed}/${checklist.length} checked`;
}

function getTimeLabel(event: TodoEvent) {
  if (event.start && event.end) {
    return `${event.start}-${event.end}`;
  }

  if (event.start) {
    return event.start;
  }

  return "All-day";
}

function getRecurrenceLabel(recurrence: TodoEvent["recurrence"]) {
  if (recurrence === "weekly") {
    return "Weekly";
  }

  if (recurrence === "monthly") {
    return "Monthly";
  }

  return "Once";
}

function getNotesPreview(notes: string, limit = 90) {
  const trimmed = notes.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= limit) {
    return trimmed;
  }

  return `${trimmed.slice(0, limit).trimEnd()}...`;
}

function getDateKeyInMonth(year: number, monthIndex: number, dayOfMonth: number) {
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  return getTodayKey(new Date(year, monthIndex, Math.min(dayOfMonth, maxDay)));
}

function loadStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light"
    ? "light"
    : "dark";
}

function createMiniMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  );
  const start = startOfWeek(firstDay);
  const end = addDays(startOfWeek(lastDay), 6);
  const days: Date[] = [];

  for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
    days.push(day);
  }

  return days;
}

function matchesFilters(event: TodoEvent, filters: TodoFilters) {
  const matchesStatus =
    (filters.showOpen && event.status === "open") ||
    (filters.showDone && event.status === "done") ||
    (filters.showCancelled && event.status === "cancelled");

  if (!matchesStatus || !filters.selectedPriorities.includes(event.priority)) {
    return false;
  }

  return !filters.hiddenCategories.includes(event.category);
}

function updateEventStatus(event: TodoEvent, status: TodoEvent["status"]) {
  const completedAt = status === "done" ? new Date().toISOString() : null;
  return {
    ...event,
    status,
    completedAt,
    updatedAt: new Date().toISOString(),
  };
}

type TodoCardProps = {
  event: TodoEvent;
  todayKey: string;
  isSelected: boolean;
  onOpen: () => void;
  onToggleTodo: () => void;
  onToggleChecklistItem: (itemId: string) => void;
  onToggleTop3: () => void;
};

function TodoCard({
  event,
  todayKey,
  isSelected,
  onOpen,
  onToggleTodo,
  onToggleChecklistItem,
  onToggleTop3,
}: TodoCardProps) {
  const categoryMeta = getCategoryMeta(event.category);
  const checklistPreview = event.checklist.slice(0, 3);
  const checklistSummary =
    event.checklist.length > 0 ? getChecklistSummary(event.checklist) : null;
  const statusLabel = event.status[0].toUpperCase() + event.status.slice(1);
  const isFocus = event.top3Date === todayKey;

  return (
    <article
      className={`todo-card ${event.status !== "open" ? "is-muted" : ""} ${isSelected ? "is-selected" : ""}`}
      style={
        {
          "--event-accent": categoryMeta.accent,
          "--event-soft": categoryMeta.soft,
        } as CSSProperties
      }
      onClick={onOpen}
    >
      <div className="todo-card__top">
        <button
          type="button"
          className={`todo-toggle ${event.status === "done" ? "is-done" : ""}`}
          aria-label={
            event.status === "done" ? "Mark todo open" : "Mark todo done"
          }
          onClick={(actionEvent) => {
            actionEvent.stopPropagation();
            onToggleTodo();
          }}
        />

        <div className="todo-card__content">
          <div className="todo-card__heading">
            <div>
              <div className="todo-card__titleline">
                <PriorityBadge priority={event.priority} compact />
                <h3>{event.title}</h3>
              </div>
              <p>{getRelativeDateLabel(event.date, todayKey)}</p>
            </div>

            <button
              type="button"
              className={`pill pill--ghost ${isFocus ? "is-focus" : ""}`}
              onClick={(actionEvent) => {
                actionEvent.stopPropagation();
                onToggleTop3();
              }}
            >
              {isFocus ? "Top 3" : "Pin Top 3"}
            </button>
          </div>

          <div className="todo-card__meta">
            <span
              className="pill"
              style={{
                borderColor: categoryMeta.border,
                background: categoryMeta.soft,
              }}
            >
              {event.category}
            </span>
            <span className="pill">{event.activity}</span>
            <span className={`pill pill--status status-${event.status}`}>
              {statusLabel}
            </span>
            <span className="pill">{getTimeLabel(event)}</span>
            {event.recurrence !== "once" ? (
              <span className="pill">{getRecurrenceLabel(event.recurrence)}</span>
            ) : null}
          </div>

          {checklistSummary ? (
            <p className="todo-card__summary">{checklistSummary}</p>
          ) : null}

          {checklistPreview.length > 0 ? (
            <div className="todo-card__checklist">
              {checklistPreview.map((item) => (
                <label
                  key={item.id}
                  className={`check-item ${item.done ? "is-done" : ""}`}
                  onClick={(actionEvent) => actionEvent.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklistItem(item.id)}
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          ) : null}

          {event.notes ? (
            <p className="todo-card__notes">{event.notes}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type WeekTodoButtonProps = {
  event: ResolvedTodoEvent;
  tooltipSide: "left" | "right";
  onSelect: () => void;
  onHover: (
    hoverEvent: ReactMouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
  ) => void;
  onLeave: () => void;
};

function WeekTodoButton({
  event,
  tooltipSide,
  onSelect,
  onHover,
  onLeave,
}: WeekTodoButtonProps) {
  const categoryMeta = getCategoryMeta(event.category);

  return (
    <button
      type="button"
      className={`week-task ${event.status !== "open" ? "is-muted" : ""}`}
      data-tooltip-side={tooltipSide}
      style={
        {
          "--event-accent": categoryMeta.accent,
          "--event-soft": categoryMeta.soft,
        } as CSSProperties
      }
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      onMouseLeave={onLeave}
      onBlur={onLeave}
    >
      <span className="week-task__line">
        <PriorityBadge priority={event.priority} dotOnly />
        <span className="week-task__title">{event.title}</span>
      </span>
    </button>
  );
}

function App() {
  const todayKey = getTodayKey();
  const [file, setFile] = useState<TodoEventFile>({ version: 1, events: [] });
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => loadStoredTheme());
  const [view, setView] = useState<"day" | "week">("week");
  const [cursorDate, setCursorDate] = useState(() => fromDateKey(todayKey));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [miniMonthDate, setMiniMonthDate] = useState(
    () => new Date(fromDateKey(todayKey)),
  );
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    eventId: null,
  });
  const [draft, setDraft] = useState(() => createEmptyTodoEvent(todayKey));
  const [notice, setNotice] = useState("");
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({
    title: "",
    date: todayKey,
    category: CATEGORY_OPTIONS[0],
    priority: "green",
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() =>
    `${fromDateKey(todayKey).getFullYear()}`,
  );
  const [weekTooltip, setWeekTooltip] = useState<WeekTooltipState | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      const loaded = await loadEventFile();
      setFile({
        version: loaded.version,
        events: sortEvents(loaded.events),
      });
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    const stopSync = startPersistenceSync();

    return () => {
      stopSync();
    };
  }, []);

  useEffect(() => {
    function handlePersistenceNotice(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) {
        setNotice(detail.message);
      }
    }

    window.addEventListener(
      PERSISTENCE_NOTICE_EVENT,
      handlePersistenceNotice as EventListener,
    );

    return () => {
      window.removeEventListener(
        PERSISTENCE_NOTICE_EVENT,
        handlePersistenceNotice as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void saveEventFile(file);
  }, [file, isReady]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePickerOpen]);

  const categoryOptions = Array.from(
    new Set([...CATEGORY_OPTIONS, ...file.events.map((event) => event.category)]),
  );
  const weekStartKey = getTodayKey(startOfWeek(cursorDate));
  const weekEndKey = getTodayKey(addDays(startOfWeek(cursorDate), 6));
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(startOfWeek(cursorDate), index),
  );
  const miniMonthDays = createMiniMonthDays(miniMonthDate);
  const miniMonthStartKey = getTodayKey(miniMonthDays[0]);
  const miniMonthEndKey = getTodayKey(miniMonthDays[miniMonthDays.length - 1]);
  const resolvedRangeStart = minDateKey(
    todayKey,
    selectedDateKey,
    weekStartKey,
    miniMonthStartKey,
  );
  const resolvedRangeEnd = maxDateKey(
    todayKey,
    selectedDateKey,
    weekEndKey,
    miniMonthEndKey,
  );
  const resolvedEvents = resolveEventsInRange(
    file.events,
    resolvedRangeStart,
    resolvedRangeEnd,
  );
  const visibleEvents = resolvedEvents.filter((event) =>
    matchesFilters(event, filters),
  );
  const selectedDateEvents = visibleEvents.filter(
    (event) => event.date === selectedDateKey,
  );
  const todayEvents = visibleEvents.filter(
    (event) => event.date === todayKey && event.status === "open",
  );
  const top3Events = file.events
    .filter((event) => event.top3Date === todayKey && event.status === "open")
    .map<ResolvedTodoEvent>((event) => {
      const occurrenceDate =
        event.recurrence === "once"
          ? event.date
          : (getNextOccurrenceOnOrAfter(
              event.date,
              event.recurrence,
              todayKey,
            ) ?? event.date);

      return {
        ...event,
        date: occurrenceDate,
        sourceEventId: event.id,
        occurrenceId:
          event.recurrence === "once" && occurrenceDate === event.date
            ? event.id
            : `${event.id}::${occurrenceDate}`,
      };
    })
    .sort((left, right) => compareDateKeys(left.date, right.date))
    .filter((event) => event.title.trim().length > 0);
  const openCount = file.events.filter(
    (event) => event.status === "open",
  ).length;
  const doneCount = file.events.filter(
    (event) => event.status === "done",
  ).length;
  const overdueCount = file.events.filter(
    (event) =>
      event.status === "open" &&
      event.recurrence === "once" &&
      compareDateKeys(event.date, todayKey) < 0,
  ).length;
  const selectedDateLabel = getFullDateLabel(selectedDateKey);
  const mainLabel = view === "day" ? selectedDateKey : getWeekLabel(cursorDate);
  const eventsByDate = visibleEvents.reduce<Record<string, ResolvedTodoEvent[]>>(
    (grouped, event) => {
      grouped[event.date] ??= [];
      grouped[event.date].push(event);
      return grouped;
    },
    {},
  );

  function applyEvents(updater: (events: TodoEvent[]) => TodoEvent[]) {
    setFile((current) => ({
      version: current.version,
      events: sortEvents(updater(current.events)),
    }));
  }

  function getSourceEvent(eventId: string) {
    return file.events.find((event) => event.id === eventId) ?? null;
  }

  function selectDate(dateKey: string, nextView?: "day" | "week") {
    const nextDate = fromDateKey(dateKey);
    setWeekTooltip(null);
    setIsDatePickerOpen(false);
    setSelectedDateKey(dateKey);
    setCursorDate(nextDate);
    setMiniMonthDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setQuickAdd((current) => ({ ...current, date: dateKey }));

    if (nextView) {
      setView(nextView);
    }
  }

  function openNewModal(dateKey = selectedDateKey) {
    setDraft(createEmptyTodoEvent(dateKey));
    setModal({ open: true, eventId: null });
  }

  function openEditModal(event: TodoEvent) {
    setDraft({
      ...event,
      checklist: event.checklist.map((item) => ({ ...item })),
    });
    setModal({ open: true, eventId: event.id });
  }

  function closeModal() {
    setModal({ open: false, eventId: null });
  }

  function updateChecklistItem(
    itemId: string,
    updater: (item: ChecklistItem) => ChecklistItem,
  ) {
    setDraft((current) => ({
      ...current,
      checklist: current.checklist.map((item) =>
        item.id === itemId ? updater(item) : item,
      ),
    }));
  }

  function ensureTop3Limit(eventId: string | null, wantsTop3: boolean) {
    if (!wantsTop3) {
      return true;
    }

    const currentCount = file.events.filter(
      (event) =>
        event.top3Date === todayKey &&
        event.status === "open" &&
        event.id !== eventId,
    ).length;

    if (currentCount >= TOP3_LIMIT) {
      setNotice("Daily Top 3 is full.");
      return false;
    }

    return true;
  }

  function handleSaveDraft(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    const title = draft.title.trim();
    if (!title) {
      setNotice("Title is required.");
      return;
    }

    const cleanedChecklist = draft.checklist
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);
    const wantsTop3 = draft.top3Date === todayKey;

    if (!ensureTop3Limit(modal.eventId, wantsTop3)) {
      return;
    }

    const nextEvent: TodoEvent = {
      ...draft,
      title,
      checklist: cleanedChecklist,
      updatedAt: new Date().toISOString(),
      completedAt:
        draft.status === "done"
          ? (draft.completedAt ?? new Date().toISOString())
          : null,
      top3Date: wantsTop3 ? todayKey : null,
    };

    applyEvents((events) => {
      if (!modal.eventId) {
        return [...events, nextEvent];
      }

      return events.map((event) =>
        event.id === modal.eventId ? nextEvent : event,
      );
    });

    selectDate(nextEvent.date);
    closeModal();
  }

  function handleQuickAdd(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    const title = quickAdd.title.trim();
    if (!title) {
      return;
    }

    const nextEvent = createEmptyTodoEvent(quickAdd.date);
    nextEvent.title = title;
    nextEvent.category = quickAdd.category;
    nextEvent.priority = quickAdd.priority;
    nextEvent.order = Date.now();

    applyEvents((events) => [...events, nextEvent]);
    setQuickAdd((current) => ({ ...current, title: "" }));
    selectDate(quickAdd.date);
  }

  function handleToggleTodo(eventId: string) {
    applyEvents((events) =>
      events.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        return updateEventStatus(
          event,
          event.status === "done" ? "open" : "done",
        );
      }),
    );
  }

  function handleToggleChecklistItem(eventId: string, itemId: string) {
    applyEvents((events) =>
      events.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        return {
          ...event,
          updatedAt: new Date().toISOString(),
          checklist: event.checklist.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  done: !item.done,
                }
              : item,
          ),
        };
      }),
    );
  }

  function handleToggleTop3(eventId: string) {
    const event = file.events.find((candidate) => candidate.id === eventId);
    if (!event) {
      return;
    }

    if (event.top3Date === todayKey) {
      applyEvents((events) =>
        events.map((candidate) =>
          candidate.id === eventId
            ? {
                ...candidate,
                top3Date: null,
                updatedAt: new Date().toISOString(),
              }
            : candidate,
        ),
      );
      return;
    }

    if (!ensureTop3Limit(eventId, true)) {
      return;
    }

    applyEvents((events) =>
      events.map((candidate) =>
        candidate.id === eventId
          ? {
              ...candidate,
              top3Date: todayKey,
              updatedAt: new Date().toISOString(),
            }
          : candidate,
      ),
    );
  }

  function handleDeleteDraft() {
    if (!modal.eventId) {
      return;
    }

    applyEvents((events) =>
      events.filter((event) => event.id !== modal.eventId),
    );
    closeModal();
  }

  function handleDraftStatus(status: TodoEvent["status"]) {
    setDraft((current) => updateEventStatus(current, status));
  }

  function jumpToMonthYear(monthIndex: number) {
    const parsedYear = Number(pickerYear);
    if (!Number.isInteger(parsedYear) || parsedYear < 1) {
      setNotice("Enter a valid year.");
      return;
    }

    const selectedDay = fromDateKey(selectedDateKey).getDate();
    selectDate(getDateKeyInMonth(parsedYear, monthIndex, selectedDay));
    setIsDatePickerOpen(false);
  }

  function handleWeekTooltipHover(
    hoverEvent:
      | ReactMouseEvent<HTMLButtonElement>
      | FocusEvent<HTMLButtonElement>,
    event: ResolvedTodoEvent,
    dayKey: string,
    side: "left" | "right",
  ) {
    const targetRect = hoverEvent.currentTarget.getBoundingClientRect();
    const weekCell = hoverEvent.currentTarget.closest(".week-cell");

    if (!weekCell) {
      return;
    }

    const weekCellRect = weekCell.getBoundingClientRect();

    setWeekTooltip({
      event,
      dayKey,
      side,
      top: targetRect.top - weekCellRect.top + targetRect.height / 2,
    });
  }

  function clearWeekTooltip() {
    setWeekTooltip(null);
  }

  function changeCursor(step: number) {
    clearWeekTooltip();
    const nextDate = addDays(cursorDate, view === "day" ? step : step * 7);
    setCursorDate(nextDate);
    setSelectedDateKey(getTodayKey(nextDate));
    setMiniMonthDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setQuickAdd((current) => ({ ...current, date: getTodayKey(nextDate) }));
  }

  function jumpToToday() {
    clearWeekTooltip();
    selectDate(todayKey);
  }

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="top">
            <div className="brand">
              <div>
                <p className="eyebrow">Oursky checklist planner</p>
                <h1>Oursky Planner</h1>
              </div>
              <p className="brand-copy">
                Calendar-first task control with focused daily execution.
              </p>
            </div>

            <div className="header-pills">
              <span className="pill">{openCount} open</span>
              <span className="pill">{doneCount} done</span>
              <span className="pill">{overdueCount} overdue</span>
              <button
                type="button"
                className="theme-toggle"
                onClick={() =>
                  setTheme((current) => (current === "dark" ? "light" : "dark"))
                }
              >
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => openNewModal()}
              >
                New Todo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="wrap page-stack">
          <section className="panel quick-add-panel">
            <div className="body quick-add-panel__body">
              <section className="quick-add-panel__top3" aria-label="Daily Top 3">
                <div className="quick-add-panel__top3-header">
                  <div>
                    <p className="eyebrow">Daily Top 3</p>
                    <p className="quick-add-panel__title">
                      {top3Events.length === 0
                        ? "Pin up to three open todos here to keep the day tight."
                        : `${top3Events.length}/${TOP3_LIMIT} pinned for ${getShortDateLabel(todayKey)}.`}
                    </p>
                  </div>
                  <span className="pill mono">{getShortDateLabel(todayKey)}</span>
                </div>

                <div className="quick-add-panel__top3-list">
                  {top3Events.length === 0 ? (
                    <p className="empty">
                      Nothing pinned yet. Use the Top 3 toggle on a task card.
                    </p>
                  ) : (
                    top3Events.map((event) => (
                      <button
                        key={event.occurrenceId}
                        type="button"
                        className="top3-item"
                        onClick={() => {
                          const sourceEvent = getSourceEvent(event.sourceEventId);
                          if (sourceEvent) {
                            openEditModal(sourceEvent);
                          }
                        }}
                      >
                        <span className="top3-item__header">
                          <PriorityBadge priority={event.priority} compact />
                        <span className="top3-item__title">{event.title}</span>
                        </span>
                        <span className="top3-item__meta">
                          <span>{event.category}</span>
                          <span>
                            {getRelativeDateLabel(event.date, todayKey)}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <form className="quick-add" onSubmit={handleQuickAdd}>
                <input
                  value={quickAdd.title}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Quick add a todo for the calendar"
                  aria-label="Quick add title"
                />
                <input
                  type="date"
                  value={quickAdd.date}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  aria-label="Quick add due date"
                />
                <select
                  value={quickAdd.category}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  aria-label="Quick add category"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={quickAdd.priority}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      priority: event.target.value as PriorityLevel,
                    }))
                  }
                  aria-label="Quick add priority"
                >
                  {PRIORITY_LEVELS.map((priority) => (
                    <option key={priority} value={priority}>
                      {`${getPriorityMeta(priority).label} - ${getPriorityMeta(priority).description}`}
                    </option>
                  ))}
                </select>
                <button type="submit" className="primary">
                  Add
                </button>
              </form>
            </div>
          </section>

          <div className="app-shell">
            <aside className="sidebar">
              <section className="panel">
                <h2>
                  <span>Calendars</span>
                  <span className="pill">Filters</span>
                </h2>
                <div className="body">
                  <div className="nav-row month-jump" ref={datePickerRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(false);
                        setMiniMonthDate(addMonths(miniMonthDate, -1));
                      }}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className={`pill mono month-jump__trigger ${isDatePickerOpen ? "is-active" : ""}`}
                      onClick={() =>
                        setIsDatePickerOpen((current) => {
                          if (!current) {
                            setPickerYear(`${miniMonthDate.getFullYear()}`);
                          }

                          return !current;
                        })
                      }
                      aria-expanded={isDatePickerOpen}
                      aria-haspopup="dialog"
                    >
                      {getMonthLabel(miniMonthDate)}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(false);
                        setMiniMonthDate(addMonths(miniMonthDate, 1));
                      }}
                    >
                      ▶
                    </button>

                    {isDatePickerOpen ? (
                      <div
                        className="month-jump__popover"
                        role="dialog"
                        aria-label="Choose month and year"
                      >
                        <div className="month-jump__header">
                          <p className="eyebrow">Jump to month</p>
                          <button
                            type="button"
                            className="pill pill--ghost"
                            onClick={() => setIsDatePickerOpen(false)}
                          >
                            Close
                          </button>
                        </div>

                        <label className="month-jump__year">
                          Year
                          <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={pickerYear}
                            onChange={(event) => setPickerYear(event.target.value)}
                          />
                        </label>

                        <div className="month-jump__grid">
                          {MONTH_LABELS.map((label, monthIndex) => {
                            const isActive =
                              Number(pickerYear) === miniMonthDate.getFullYear() &&
                              monthIndex === miniMonthDate.getMonth();

                            return (
                              <button
                                key={label}
                                type="button"
                                className={`month-jump__month ${isActive ? "is-active" : ""}`}
                                onClick={() => jumpToMonthYear(monthIndex)}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mini-calendar">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (label) => (
                        <div key={label} className="dow">
                          {label}
                        </div>
                      ),
                    )}

                    {miniMonthDays.map((day) => {
                      const dateKey = getTodayKey(day);
                      const count = eventsByDate[dateKey]?.length ?? 0;
                      const isCurrentMonth =
                        day.getMonth() === miniMonthDate.getMonth();
                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          className={`mini-day ${isCurrentMonth ? "" : "is-outside"} ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
                          onClick={() => selectDate(dateKey)}
                        >
                          <span>{day.getDate()}</span>
                          {count > 0 ? <em>{count}</em> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="sidebar-group">
                    <div className="sidebar-label">Show</div>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={filters.showOpen}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            showOpen: event.target.checked,
                          }))
                        }
                      />
                      <span>Open</span>
                    </label>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={filters.showDone}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            showDone: event.target.checked,
                          }))
                        }
                      />
                      <span>Done</span>
                    </label>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={filters.showCancelled}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            showCancelled: event.target.checked,
                          }))
                        }
                      />
                      <span>Cancelled</span>
                    </label>
                  </div>

                  <div className="sidebar-group">
                    <div className="sidebar-label">Tags</div>
                    <div className="filter-tag-row" aria-label="Tag filters">
                      {categoryOptions.map((category) => {
                        const categoryMeta = getCategoryMeta(category);
                        const isActive =
                          !filters.hiddenCategories.includes(category);

                        return (
                          <button
                            key={category}
                            type="button"
                            className={`pill filter-tag ${isActive ? "is-active" : "is-inactive"}`}
                            aria-pressed={isActive}
                            onClick={() =>
                              setFilters((current) => ({
                                ...current,
                                hiddenCategories: isActive
                                  ? [...current.hiddenCategories, category]
                                  : current.hiddenCategories.filter(
                                      (value) => value !== category,
                                    ),
                              }))
                            }
                            style={
                              isActive
                                ? {
                                    borderColor: categoryMeta.border,
                                    background: categoryMeta.soft,
                                  }
                                : undefined
                            }
                          >
                            <span
                              className="filter-tag__swatch"
                              aria-hidden="true"
                              style={{ background: categoryMeta.accent }}
                            />
                            <span>{category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sidebar-group">
                    <div className="sidebar-label">Priorities</div>
                    <div className="filter-tag-row" aria-label="Priority filters">
                      {PRIORITY_LEVELS.map((priority) => {
                        const isActive =
                          filters.selectedPriorities.includes(priority);

                        return (
                          <button
                            key={priority}
                            type="button"
                            className={`pill filter-tag filter-tag--priority ${isActive ? "is-active" : "is-inactive"}`}
                            aria-pressed={isActive}
                            onClick={() =>
                              setFilters((current) => ({
                                ...current,
                                selectedPriorities: isActive
                                  ? current.selectedPriorities.filter(
                                      (value) => value !== priority,
                                    )
                                  : Array.from(
                                      new Set([
                                        ...current.selectedPriorities,
                                        priority,
                                      ]),
                                    ),
                              }))
                            }
                            aria-label={`${getPriorityMeta(priority).label} priority filter`}
                          >
                            <PriorityBadge priority={priority} dotOnly />
                            <span>{getPriorityMeta(priority).label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel">
                <h2>
                  <span>Day Snapshot</span>
                  <span className="pill mono">{getShortDateLabel(selectedDateKey)}</span>
                </h2>
                <div className="body">
                  <p className="detail-title">{selectedDateLabel}</p>
                  <p className="detail-copy">
                    {selectedDateEvents.length > 0
                      ? `${selectedDateEvents.length} todo${selectedDateEvents.length === 1 ? "" : "s"} on deck.`
                      : "No visible todos scheduled."}
                  </p>
                  <p className="detail-copy">
                    {todayEvents.length} open for today. {top3Events.length}/
                    {TOP3_LIMIT} pinned into focus.
                  </p>
                </div>
              </section>
            </aside>

            <section className="panel main-panel">
              <h2>
                <span>{view === "day" ? "Day" : "Week"}</span>
                <span className="pill mono">{mainLabel}</span>
              </h2>

              <div className="body">
                <div className="view-toolbar">
                  <div className="nav-row">
                    <button type="button" onClick={() => changeCursor(-1)}>
                      Prev
                    </button>
                    <button type="button" onClick={jumpToToday}>
                      Today
                    </button>
                    <button type="button" onClick={() => changeCursor(1)}>
                      Next
                    </button>
                  </div>

                  <div className="nav-row">
                    <button
                      type="button"
                      className={view === "day" ? "primary" : ""}
                      onClick={() => {
                        clearWeekTooltip();
                        setView("day");
                      }}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      className={view === "week" ? "primary" : ""}
                      onClick={() => {
                        clearWeekTooltip();
                        setView("week");
                      }}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => openNewModal()}
                    >
                      Add Todo
                    </button>
                  </div>
                </div>

                {notice ? <div className="notice">{notice}</div> : null}

                {view === "day" ? (
                  <div className="day-view calendar-view">
                    <div className="day-header">
                      <div>
                        <p className="eyebrow">Day agenda</p>
                        <h3>{selectedDateLabel}</h3>
                      </div>
                      <span className="pill">
                        {selectedDateEvents.length} items
                      </span>
                    </div>

                    <div className="task-stack calendar-scroll">
                      {selectedDateEvents.length === 0 ? (
                        <p className="empty">
                          No todos for this day with the current filters.
                        </p>
                      ) : (
                        selectedDateEvents.map((event) => (
                          <TodoCard
                            key={event.occurrenceId}
                            event={event}
                            todayKey={todayKey}
                            isSelected={modal.eventId === event.sourceEventId}
                            onOpen={() => {
                              const sourceEvent = getSourceEvent(event.sourceEventId);
                              if (sourceEvent) {
                                openEditModal(sourceEvent);
                              }
                            }}
                            onToggleTodo={() => handleToggleTodo(event.sourceEventId)}
                            onToggleChecklistItem={(itemId) =>
                              handleToggleChecklistItem(event.sourceEventId, itemId)
                            }
                            onToggleTop3={() => handleToggleTop3(event.sourceEventId)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="week-view calendar-view">
                    <div className="week-grid">
                      {weekDays.map((day) => {
                        const dateKey = getTodayKey(day);
                        const events = eventsByDate[dateKey] ?? [];

                        return (
                          <section
                            key={dateKey}
                            className={`week-cell ${dateKey === todayKey ? "is-today" : ""} ${dateKey === selectedDateKey ? "is-selected" : ""}`}
                            style={
                              weekTooltip?.dayKey === dateKey ? { zIndex: 4 } : undefined
                            }
                          >
                            <button
                              type="button"
                              className="week-cell__header"
                              onClick={() => selectDate(dateKey, "day")}
                            >
                              <div className="week-cell__header-copy">
                                <span className="mono">{dateKey.slice(5)}</span>
                                <strong>{getWeekdayLabel(dateKey)}</strong>
                              </div>
                            </button>

                            <div className="week-task-list calendar-scroll">
                              {events.length === 0 ? (
                                <p className="empty">—</p>
                              ) : (
                                events.map((event) => {
                                  const tooltipSide =
                                    day.getDay() === 0 || day.getDay() === 6
                                      ? "left"
                                      : "right";

                                  return (
                                    <WeekTodoButton
                                      key={event.occurrenceId}
                                      event={event}
                                      tooltipSide={tooltipSide}
                                      onHover={(hoverEvent) =>
                                        handleWeekTooltipHover(
                                          hoverEvent,
                                          event,
                                          dateKey,
                                          tooltipSide,
                                        )
                                      }
                                      onLeave={clearWeekTooltip}
                                      onSelect={() => selectDate(event.date, "day")}
                                    />
                                  );
                                })
                              )}
                            </div>

                            {weekTooltip?.dayKey === dateKey ? (
                              <div className="week-cell__tooltip-layer" aria-hidden="true">
                                <article
                                  className={`week-tooltip week-tooltip--${weekTooltip.side}`}
                                  style={{ top: `${weekTooltip.top}px` }}
                                >
                                  <p className="week-tooltip__title">
                                    {weekTooltip.event.title}
                                  </p>
                                  <dl className="week-tooltip__details">
                                    <div>
                                      <dt>Date</dt>
                                      <dd>{getFullDateLabel(weekTooltip.event.date)}</dd>
                                    </div>
                                    <div>
                                      <dt>Time</dt>
                                      <dd>{getTimeLabel(weekTooltip.event)}</dd>
                                    </div>
                                    <div>
                                      <dt>Location</dt>
                                      <dd>
                                        {weekTooltip.event.location || "No location"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>Notes</dt>
                                      <dd>
                                        {getNotesPreview(weekTooltip.event.notes) ||
                                          "No notes"}
                                      </dd>
                                    </div>
                                  </dl>
                                </article>
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {modal.open ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="modal panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>
              <span>{modal.eventId ? "Edit Todo" : "New Todo"}</span>
              <span className="pill">Checklist</span>
            </h2>

            <form className="modal-form" onSubmit={handleSaveDraft}>
              <div className="body modal-form__scroll">
                <label>
                  Title
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Outline the task"
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Date
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Start time
                    <input
                      type="time"
                      value={draft.start}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          start: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    End time
                    <input
                      type="time"
                      value={draft.end}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          end: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Kind
                    <select
                      value={draft.activity}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          activity: event.target.value,
                        }))
                      }
                    >
                      {ACTIVITY_OPTIONS.map((activity) => (
                        <option key={activity} value={activity}>
                          {activity}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Recurrence
                    <select
                      value={draft.recurrence}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          recurrence: event.target.value as TodoEvent["recurrence"],
                        }))
                      }
                    >
                      {RECURRENCE_OPTIONS.map((recurrence) => (
                        <option key={recurrence} value={recurrence}>
                          {getRecurrenceLabel(recurrence)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="field-group">
                  <span>Priority</span>
                  <div
                    className="priority-selection"
                    role="radiogroup"
                    aria-label="Priority"
                  >
                    {PRIORITY_LEVELS.map((priority) => {
                      const priorityMeta = getPriorityMeta(priority);

                      return (
                        <button
                          key={priority}
                          type="button"
                          role="radio"
                          aria-checked={draft.priority === priority}
                          className={`priority-option ${draft.priority === priority ? "is-active" : ""}`}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              priority,
                            }))
                          }
                        >
                          <span className="priority-option__radio" aria-hidden="true">
                            <span className="priority-option__radio-dot" />
                          </span>
                          <PriorityBadge priority={priority} dotOnly />
                          <span className="priority-option__label">
                            {priorityMeta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label>
                  Location
                  <input
                    value={draft.location}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Desk, Figma, phone, commute"
                  />
                </label>

                <label>
                  Notes
                  <textarea
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Supporting context, dependencies, or next action"
                  />
                </label>

                <div className="status-row">
                  {(["open", "done", "cancelled"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`pill pill--ghost ${draft.status === status ? "is-focus" : ""}`}
                      onClick={() => handleDraftStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <label>
                  Add to today&apos;s Top 3
                  <button
                    type="button"
                    className={`toggle-pill ${draft.top3Date === todayKey ? "is-active" : ""}`}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        top3Date:
                          current.top3Date === todayKey ? null : todayKey,
                      }))
                    }
                  >
                    {draft.top3Date === todayKey ? "Pinned" : "Not pinned"}
                  </button>
                </label>

                <div className="checklist-editor">
                  <div className="checklist-editor__header">
                    <span>Checklist items</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          checklist: [
                            ...current.checklist,
                            {
                              id:
                                typeof crypto !== "undefined" &&
                                "randomUUID" in crypto
                                  ? crypto.randomUUID()
                                  : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                              text: "",
                              done: false,
                            },
                          ],
                        }))
                      }
                    >
                      Add item
                    </button>
                  </div>

                  <div className="checklist-editor__list">
                    {draft.checklist.length === 0 ? (
                      <p className="empty">
                        Break the todo into subtasks when needed.
                      </p>
                    ) : (
                      draft.checklist.map((item) => (
                        <div key={item.id} className="checklist-editor__item">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() =>
                              updateChecklistItem(item.id, (current) => ({
                                ...current,
                                done: !current.done,
                              }))
                            }
                          />
                          <input
                            value={item.text}
                            onChange={(event) =>
                              updateChecklistItem(item.id, (current) => ({
                                ...current,
                                text: event.target.value,
                              }))
                            }
                            placeholder="Describe a subtask"
                          />
                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                checklist: current.checklist.filter(
                                  (entry) => entry.id !== item.id,
                                ),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <div className="modal-actions__group">
                  <button type="submit" className="primary">
                    Save
                  </button>
                  <button type="button" className="danger" onClick={closeModal}>
                    Close
                  </button>
                </div>

                {modal.eventId ? (
                  <div className="modal-actions__group">
                    <button
                      type="button"
                      onClick={() => handleDraftStatus("done")}
                    >
                      Mark Done
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDraftStatus("cancelled")}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={handleDeleteDraft}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;
