import { useEffect, useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import { CURRENT_USER } from '../../config/currentUser'
import { useCurrentUser } from '../../context/useCurrentUser'
import {
  deleteAdopter,
  getAdopter,
  getAdopterSummary,
  updateAdopter,
} from '../../services/adopterService'
import styles from './ProfilePage.module.css'

function initialsOf(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// HU12 - Gestionar información del adoptante.
export default function ProfilePage({ adopterId = CURRENT_USER.adopterId }) {
  const { user } = useCurrentUser()
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [adopter, setAdopter] = useState(null)
  const [summary, setSummary] = useState({ requestsCount: 0, adoptionsCount: 0, reviewsCount: 0 })
  const [form, setForm] = useState({ address: '', phone: '', occupation: '' })
  const [feedback, setFeedback] = useState(null)
  const [deleted, setDeleted] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getAdopter(adopterId), getAdopterSummary(adopterId)])
      .then(([loadedAdopter, loadedSummary]) => {
        if (!active) return
        setAdopter(loadedAdopter)
        setSummary(loadedSummary)
        setForm({
          address: loadedAdopter.address,
          phone: loadedAdopter.phone,
          occupation: loadedAdopter.occupation ?? '',
        })
        setLoadState('ready')
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error.message)
        setLoadState('error')
      })
    return () => {
      active = false
    }
  }, [adopterId])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSave(event) {
    event.preventDefault()
    setFeedback(null)
    try {
      const saved = await updateAdopter(adopterId, form)
      setAdopter(saved)
      setFeedback({ type: 'success', text: 'Cambios guardados.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  function handleDiscard() {
    setForm({
      address: adopter.address,
      phone: adopter.phone,
      occupation: adopter.occupation ?? '',
    })
    setFeedback(null)
  }

  async function handleDelete() {
    setFeedback(null)
    try {
      await deleteAdopter(adopterId)
      setDeleted(true)
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  if (loadState === 'loading') return <ScreenState state="loading" />
  if (loadState === 'error') return <ScreenState state="error" message={loadError} />
  if (deleted) {
    return <ScreenState state="empty" message="Tu registro de adoptante fue eliminado." />
  }

  const { requestsCount, adoptionsCount, reviewsCount } = summary
  const hasRecords = requestsCount > 0 || adoptionsCount > 0 || reviewsCount > 0

  return (
    <>
      <h1>Mi perfil de adoptante</h1>
      <p className={styles.subtitle}>
        Mantén tus datos personales al día para que el refugio pueda contactarte.
      </p>

      <div className={styles.layout}>
        <Card>
          <div className={styles.summary}>
            <div className={styles.avatar} aria-hidden="true">
              {initialsOf(user.name)}
            </div>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.role}>Adoptante · ID {adopter.id}</p>
          </div>
          <dl className={styles.stats}>
            <div>
              <dd>{requestsCount}</dd>
              <dt>Solicitudes</dt>
            </div>
            <div>
              <dd>{adoptionsCount}</dd>
              <dt>Adopciones</dt>
            </div>
            <div>
              <dd>{reviewsCount}</dd>
              <dt>Reseñas</dt>
            </div>
          </dl>
        </Card>

        <div className={styles.column}>
          <Card title="Mis datos personales">
            <form onSubmit={handleSave} noValidate>
              <div className={styles.field}>
                <label htmlFor="adopter-address">
                  Dirección <span className={styles.required}>*</span>
                </label>
                <input
                  id="adopter-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="adopter-phone">
                    Teléfono <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="adopter-phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="adopter-occupation">Ocupación</label>
                  <input
                    id="adopter-occupation"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className={styles.help}>
                * Campos obligatorios. Si falta uno, los cambios no se guardan y se muestra el
                motivo.
              </p>
              {feedback && (
                <p
                  className={feedback.type === 'error' ? styles.error : styles.success}
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                >
                  {feedback.text}
                </p>
              )}
              <div className={styles.actions}>
                <Button type="submit">Guardar cambios</Button>
                <Button variant="secondary" onClick={handleDiscard}>
                  Descartar
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Eliminar adoptante">
            {hasRecords ? (
              <p className={styles.warning}>
                No disponible: tienes adopciones, solicitudes de adopción o reseñas registradas.
              </p>
            ) : (
              <p className={styles.help}>Esta acción elimina tu registro de adoptante.</p>
            )}
            <Button variant="danger" disabled={hasRecords} onClick={handleDelete}>
              Eliminar mi registro
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}
