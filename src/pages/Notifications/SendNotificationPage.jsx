import { useEffect, useState } from 'react'
import ScreenState from '../../components/ScreenState/ScreenState'
import { createNotification } from '../../services/notificationService'
import { listUsers, userLabel } from '../../services/userService'
import NotificationForm from './NotificationForm'
import styles from './SendNotificationPage.module.css'

export default function SendNotificationPage() {
  const [recipients, setRecipients] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    listUsers()
      .then((users) => {
        setRecipients(users.map((user) => ({ value: String(user.id), label: userLabel(user) })))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return <ScreenState state="loading" />
  }
  if (status === 'error') {
    return <ScreenState state="error" message="No se pudieron cargar los usuarios." />
  }

  return (
    <div className={styles.page}>
      <h1>Enviar notificación</h1>
      <p className={styles.subtitle}>
        Informa a un usuario sobre cambios en su proceso de adopción.
      </p>
      <NotificationForm recipients={recipients} onSubmit={createNotification} />
    </div>
  )
}