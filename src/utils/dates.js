const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Today's date in the user's local time zone, formatted as YYYY-MM-DD.
// (toISOString() would use UTC and could return tomorrow's date in the evening.)
export function todayISO(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// '2026-10-21' -> '21 oct 2026'
export function formatShortDate(iso) {
  const [year, month, day] = iso.split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}
