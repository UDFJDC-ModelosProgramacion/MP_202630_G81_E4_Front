import { useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import { CHANNELS } from './channels'
import { validateNotification } from './validateNotification'
import styles from './NotificationForm.module.css'

const EMPTY_VALUES = { userId: '', adoptionId: '', petId: '', channel: '', content: '' }

export default function NotificationForm({ recipients, onSubmit }) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function reset() {
    setValues(EMPTY_VALUES)
    setErrors({})
    setSubmitError('')
    setSent(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateNotification(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSent(false)
    try {
      await onSubmit(values)
      reset()
      setSent(true)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) =>
    errors[name] && (
      <p className={styles.error} role="alert">
        {errors[name]}
      </p>
    )

  return (
    <Card title="Nueva notificación">
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="notification-user">Destinatario *</label>
          <select
            id="notification-user"
            name="userId"
            value={values.userId}
            onChange={handleChange}
            aria-invalid={Boolean(errors.userId)}
          >
            <option value="">Selecciona un destinatario</option>
            {recipients.map((recipient) => (
              <option key={recipient.value} value={recipient.value}>
                {recipient.label}
              </option>
            ))}
          </select>
          {fieldError('userId')}
        </div>

        <div className={styles.field}>
          <label htmlFor="notification-channel">Canal *</label>
          <select
            id="notification-channel"
            name="channel"
            value={values.channel}
            onChange={handleChange}
            aria-invalid={Boolean(errors.channel)}
          >
            <option value="">Selecciona un canal</option>
            {CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
          {fieldError('channel')}
        </div>

        <div className={styles.field}>
          <label htmlFor="notification-adoption">Adopción *</label>
          <input
            id="notification-adoption"
            name="adoptionId"
            type="number"
            min="1"
            value={values.adoptionId}
            onChange={handleChange}
            placeholder="Id de la adopción"
            aria-invalid={Boolean(errors.adoptionId)}
          />
          {fieldError('adoptionId')}
        </div>

        <div className={styles.field}>
          <label htmlFor="notification-pet">Mascota (opcional)</label>
          <input
            id="notification-pet"
            name="petId"
            type="number"
            min="1"
            value={values.petId}
            onChange={handleChange}
            placeholder="Id de la mascota"
            aria-invalid={Boolean(errors.petId)}
          />
          {fieldError('petId')}
        </div>

        <div className={styles.field}>
          <label htmlFor="notification-content">Contenido *</label>
          <textarea
            id="notification-content"
            name="content"
            rows={4}
            value={values.content}
            onChange={handleChange}
            placeholder="Escribe el mensaje de la notificación..."
            aria-invalid={Boolean(errors.content)}
          />
          {fieldError('content')}
        </div>

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}
        {sent && (
          <p className={styles.success} role="status">
            Notificación enviada.
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={submitting}>
            Enviar notificación
          </Button>
          <Button variant="secondary" onClick={reset}>
            Cancelar
          </Button>
        </div>
        <p className={styles.note}>
          * Campos obligatorios. La notificación le llega al destinatario como no leída.
        </p>
      </form>
    </Card>
  )
}