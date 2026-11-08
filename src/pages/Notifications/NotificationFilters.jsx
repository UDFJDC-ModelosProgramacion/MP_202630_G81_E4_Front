import styles from './NotificationFilters.module.css'

const OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'adoption', label: 'Por adopción' },
  { value: 'pet', label: 'Por mascota' },
]

export default function NotificationFilters({ value, onChange }) {
  return (
    <div className={styles.filters} role="group" aria-label="Filtrar notificaciones">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.pill} ${option.value === value ? styles.active : ''}`}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}