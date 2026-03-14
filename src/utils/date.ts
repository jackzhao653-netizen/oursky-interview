const WEEKDAY_TO_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const relativeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const longFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`)
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addMonths(date: Date, amount: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

export function parseNaturalDateInput(input: string, baseDate = new Date()) {
  const trimmed = input.trim()
  const normalized = trimmed.toLowerCase()

  if (!trimmed) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  if (normalized === 'today') {
    return getTodayKey(baseDate)
  }

  if (normalized === 'tomorrow') {
    return getTodayKey(addDays(baseDate, 1))
  }

  const inDaysMatch = normalized.match(/^in\s+(\d+)\s+days?$/)
  if (inDaysMatch) {
    return getTodayKey(addDays(baseDate, Number(inDaysMatch[1])))
  }

  const inWeeksMatch = normalized.match(/^in\s+(\d+)\s+weeks?$/)
  if (inWeeksMatch) {
    return getTodayKey(addDays(baseDate, Number(inWeeksMatch[1]) * 7))
  }

  const nextWeekdayMatch = normalized.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (nextWeekdayMatch) {
    const target = WEEKDAY_TO_INDEX[nextWeekdayMatch[1]]
    const current = baseDate.getDay()
    const delta = ((target - current + 7) % 7) || 7
    return getTodayKey(addDays(baseDate, delta))
  }

  const weekdayMatch = normalized.match(/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (weekdayMatch) {
    const target = WEEKDAY_TO_INDEX[weekdayMatch[1]]
    const current = baseDate.getDay()
    const delta = (target - current + 7) % 7
    return getTodayKey(addDays(baseDate, delta))
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return getTodayKey(parsed)
  }

  return null
}

export function formatDateLabel(dateKey: string) {
  return relativeFormatter.format(fromDateKey(dateKey))
}

export function formatLongDateLabel(dateKey: string) {
  return longFormatter.format(fromDateKey(dateKey))
}

export function getRelativeDueLabel(dateKey: string, todayKey: string) {
  const deltaMs = fromDateKey(dateKey).getTime() - fromDateKey(todayKey).getTime()
  const deltaDays = Math.round(deltaMs / 86400000)

  if (deltaDays === 0) {
    return 'Due today'
  }

  if (deltaDays === 1) {
    return 'Due tomorrow'
  }

  if (deltaDays < 0) {
    return `Overdue by ${Math.abs(deltaDays)} day${Math.abs(deltaDays) === 1 ? '' : 's'}`
  }

  return formatDateLabel(dateKey)
}

export function isOverdue(dateKey: string, todayKey: string) {
  return fromDateKey(dateKey).getTime() < fromDateKey(todayKey).getTime()
}

export function isWithinDays(dateKey: string, todayKey: string, days: number) {
  const deltaMs = fromDateKey(dateKey).getTime() - fromDateKey(todayKey).getTime()
  const deltaDays = Math.round(deltaMs / 86400000)
  return deltaDays >= 0 && deltaDays <= days
}
