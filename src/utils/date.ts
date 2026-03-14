import type { TodoRecurrence } from "../types/todo";

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
});

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMonthOffset(anchor: Date, target: Date) {
  return (
    (target.getFullYear() - anchor.getFullYear()) * 12 +
    (target.getMonth() - anchor.getMonth())
  );
}

export function getMonthlyOccurrenceDate(dateKey: string, monthOffset: number) {
  const anchor = fromDateKey(dateKey);
  const targetMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + monthOffset,
    1,
  );
  const day = Math.min(
    anchor.getDate(),
    getDaysInMonth(targetMonth.getFullYear(), targetMonth.getMonth()),
  );

  return getTodayKey(
    new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day),
  );
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - offset);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getMonthLabel(date: Date) {
  return monthFormatter.format(date);
}

export function getWeekLabel(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  return `${getTodayKey(start)}..${getTodayKey(end)}`;
}

export function getShortDateLabel(dateKey: string) {
  return shortDateFormatter.format(fromDateKey(dateKey));
}

export function getFullDateLabel(dateKey: string) {
  return fullDateFormatter.format(fromDateKey(dateKey));
}

export function getWeekdayLabel(dateKey: string) {
  return weekdayFormatter.format(fromDateKey(dateKey));
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function minDateKey(...dateKeys: string[]) {
  return [...dateKeys].sort(compareDateKeys)[0];
}

export function maxDateKey(...dateKeys: string[]) {
  return [...dateKeys].sort(compareDateKeys).at(-1) ?? dateKeys[0];
}

export function getDateDistance(dateKey: string, todayKey: string) {
  const deltaMs =
    fromDateKey(dateKey).getTime() - fromDateKey(todayKey).getTime();
  return Math.round(deltaMs / 86400000);
}

export function getRelativeDateLabel(dateKey: string, todayKey: string) {
  const distance = getDateDistance(dateKey, todayKey);

  if (distance === 0) {
    return "Due today";
  }

  if (distance === 1) {
    return "Due tomorrow";
  }

  if (distance === -1) {
    return "Overdue by 1 day";
  }

  if (distance < 0) {
    return `Overdue by ${Math.abs(distance)} days`;
  }

  return getShortDateLabel(dateKey);
}

export function getNextOccurrenceOnOrAfter(
  dateKey: string,
  recurrence: TodoRecurrence,
  fromDateKeyValue: string,
) {
  if (compareDateKeys(dateKey, fromDateKeyValue) >= 0) {
    return dateKey;
  }

  if (recurrence === "once") {
    return null;
  }

  if (recurrence === "weekly") {
    const anchor = fromDateKey(dateKey);
    const from = fromDateKey(fromDateKeyValue);
    const deltaDays = Math.floor(
      (from.getTime() - anchor.getTime()) / 86400000,
    );
    const weeksToAdd = Math.max(Math.ceil(deltaDays / 7), 0);
    return getTodayKey(addDays(anchor, weeksToAdd * 7));
  }

  const anchor = fromDateKey(dateKey);
  const from = fromDateKey(fromDateKeyValue);
  let monthOffset = Math.max(getMonthOffset(anchor, from), 0);
  let candidate = getMonthlyOccurrenceDate(dateKey, monthOffset);

  if (compareDateKeys(candidate, fromDateKeyValue) < 0) {
    monthOffset += 1;
    candidate = getMonthlyOccurrenceDate(dateKey, monthOffset);
  }

  return candidate;
}

export function getOccurrenceDatesInRange(
  dateKey: string,
  recurrence: TodoRecurrence,
  rangeStart: string,
  rangeEnd: string,
  recurrenceCount: number | null = null,
  recurrenceEndDate: string | null = null,
) {
  if (compareDateKeys(rangeStart, rangeEnd) > 0) {
    return [];
  }

  const first = getNextOccurrenceOnOrAfter(dateKey, recurrence, rangeStart);
  if (!first || compareDateKeys(first, rangeEnd) > 0) {
    return [];
  }

  // Apply recurrence end date limit
  const effectiveEnd = recurrenceEndDate && compareDateKeys(recurrenceEndDate, rangeEnd) < 0
    ? recurrenceEndDate
    : rangeEnd;

  if (recurrence === "once") {
    return [first];
  }

  if (recurrence === "weekly") {
    const occurrences: string[] = [];

    for (
      let cursor = fromDateKey(first);
      compareDateKeys(getTodayKey(cursor), effectiveEnd) <= 0;
      cursor = addDays(cursor, 7)
    ) {
      occurrences.push(getTodayKey(cursor));
      
      // Apply recurrence count limit
      if (recurrenceCount !== null && occurrences.length >= recurrenceCount) {
        break;
      }
    }

    return occurrences;
  }

  const occurrences: string[] = [];
  const anchor = fromDateKey(dateKey);
  let monthOffset = getMonthOffset(anchor, fromDateKey(first));

  for (;;) {
    const occurrence = getMonthlyOccurrenceDate(dateKey, monthOffset);

    if (compareDateKeys(occurrence, effectiveEnd) > 0) {
      return occurrences;
    }

    occurrences.push(occurrence);
    
    // Apply recurrence count limit
    if (recurrenceCount !== null && occurrences.length >= recurrenceCount) {
      return occurrences;
    }
    
    monthOffset += 1;
  }
}
