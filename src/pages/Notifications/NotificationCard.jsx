import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import { formatRelativeTime } from '../../utils/relativeTime'
import styles from './NotificationCard.module.css'

const CHANNEL_LABELS = { email: 'Correo', sms: 'SMS', push: 'Push' }

export default function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  const { content, channel, date, read, adoption, pet } = notification

  const details = [formatRelativeTime(date)]
  if (adoption) {
    details.push(`Adopción #${adoption.id}`)
  }
  if (pet) {
    details.push(`Mascota: ${pet.name}`)
  }

  return (
    <li className={`${styles.card} ${read ? '' : styles.unread}`}>
      <span className={styles.dotSlot}>
        {!read && <span className={styles.dot} aria-hidden="true" />}
      </span>

      <div className={styles.body}>
        <p className={styles.title}>{content}</p>
        <p className={styles.meta}>{details.join(' · ')}</p>
        <div className={styles.badges}>
          <Badge>{CHANNEL_LABELS[channel] ?? channel}</Badge>
          <Badge tone={read ? 'success' : 'warning'}>{read ? 'Leída' : 'No leída'}</Badge>
        </div>
      </div>

      <div className={styles.actions}>
        {!read && (
          <Button
            aria-label={`Marcar como leída: ${content}`}
            onClick={() => onMarkAsRead(notification)}
          >
            Marcar como leída
          </Button>
        )}
        <Button
          variant="danger"
          aria-label={`Eliminar: ${content}`}
          disabled={!read}
          onClick={() => onDelete(notification)}
        >
          Eliminar
        </Button>
        {!read && (
          <p className={styles.hint}>Solo se puede eliminar una notificación leída</p>
        )}
      </div>
    </li>
  )
}