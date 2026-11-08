import { useEffect, useState } from 'react'
import ScreenState from '../../components/ScreenState/ScreenState'
import { CURRENT_USER } from '../../config/currentUser'
import {
  deleteNotification,
  listNotifications,
  markAsRead,
} from '../../services/notificationService'
import { filterNotifications } from './filterNotifications'
import NotificationCard from './NotificationCard'
import NotificationFilters from './NotificationFilters'
import styles from './NotificationsPage.module.css'

const USER_ID = CURRENT_USER.userId

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    listNotifications(USER_ID)
      .then((list) => {
        setNotifications(list)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter)
    setFeedback(null)
  }

  async function handleMarkAsRead(notification) {
    try {
      const updated = await markAsRead(notification.id, USER_ID)
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setFeedback({ type: 'success', text: 'Notificación marcada como leída.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  async function handleDelete(notification) {
    try {
      await deleteNotification(notification.id, USER_ID)
      setNotifications((current) => current.filter((item) => item.id !== notification.id))
      setFeedback({ type: 'success', text: 'Notificación eliminada.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  if (status === 'loading') {
    return <ScreenState state="loading" />
  }
  if (status === 'error') {
    return <ScreenState state="error" message="No se pudieron cargar las notificaciones." />
  }

  const visible = filterNotifications(notifications, filter)

  return (
    <>
      <h1>HU16 · Mis notificaciones</h1>
      <NotificationFilters value={filter} onChange={handleFilterChange} />

      {feedback && (
        <p
          className={feedback.type === 'error' ? styles.error : styles.success}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}

      {visible.length === 0 ? (
        <ScreenState state="empty" message="No hay notificaciones en esta vista." />
      ) : (
        <ul className={styles.list}>
          {visible.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </>
  )
}