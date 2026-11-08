const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function formatRelativeTime(isoDate, now = new Date()) {
  const elapsed = Math.max(0, now.getTime() - new Date(isoDate).getTime())

  if (elapsed < MINUTE) {
    return 'Hace un momento'
  }
  if (elapsed < HOUR) {
    return `Hace ${Math.floor(elapsed / MINUTE)} min`
  }
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR)
    return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  }
  const days = Math.floor(elapsed / DAY)
  return days === 1 ? 'Ayer' : `Hace ${days} días`
}