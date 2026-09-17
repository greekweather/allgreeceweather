const ATHENS_OFFSET_RULES = [
  {
    start: Date.UTC(2026, 2, 29, 1),
    end: Date.UTC(2026, 9, 25, 1),
    offset: 3,
  },
  {
    start: Date.UTC(2027, 2, 28, 1),
    end: Date.UTC(2027, 9, 31, 1),
    offset: 3,
  },
]

export function athensLocalToUTC(value: string): string {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  )

  if (!match) {
    throw new Error('Invalid Athens local date')
  }

  const [, year, month, day, hour, minute, second = '00'] = match

  const localTimestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )

  const isDST = ATHENS_OFFSET_RULES.some(
    ({ start, end }) =>
      localTimestamp >= start && localTimestamp < end
  )

  const offsetHours = isDST ? 3 : 2

  return new Date(
    localTimestamp - offsetHours * 60 * 60 * 1000
  ).toISOString()
}
