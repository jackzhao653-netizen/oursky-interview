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
