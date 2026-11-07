import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../Button/Button'
import Card from '../Card/Card'
import ScreenState from '../ScreenState/ScreenState'
import { getFollowUpById } from '../../services/followUpService'
import styles from './FollowUpDetail.module.css'

export default function FollowUpDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [followUp, setFollowUp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getFollowUpById(id)
        if (!cancelled) setFollowUp(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <ScreenState state="loading" message="Cargando detalle..." />

  if (error) {
    return (
      <div className={styles.page}>
        <Card title="Detalle del seguimiento">
          <p className={styles.error} role="alert">
            {error}
          </p>
          <Button type="button" variant="secondary" onClick={() => navigate('/follow-ups')}>
            Volver a la lista
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Detalle del seguimiento {followUp.id}</h1>
        <Link to="/follow-ups" className={styles.backLink}>
          ← Volver a la lista
        </Link>
      </div>

      <Card title="Información general">
        <dl className={styles.grid}>
          <div className={styles.item}>
            <dt>ID seguimiento</dt>
            <dd>{followUp.id}</dd>
          </div>
          <div className={styles.item}>
            <dt>Fecha</dt>
            <dd>{followUp.date}</dd>
          </div>
          <div className={styles.item}>
            <dt>Estado</dt>
            <dd>
              <span className={`${styles.badge} ${styles[`status_${followUp.status}`] || ''}`}>
                {followUp.status}
              </span>
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Mascota</dt>
            <dd>{followUp.petName}</dd>
          </div>
          <div className={styles.item}>
            <dt>Adopción</dt>
            <dd>
              {followUp.adoptionId}
              <br />
              <span className={styles.muted}>{followUp.adopterName}</span>
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Veterinario responsable</dt>
            <dd>{followUp.vetName}</dd>
          </div>
          <div className={styles.itemFull}>
            <dt>Notas / observaciones</dt>
            <dd>{followUp.notes || 'Sin notas registradas.'}</dd>
          </div>
        </dl>
      </Card>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(`/follow-ups/${followUp.id}/edit`)}
        >
          Editar seguimiento
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/follow-ups')}>
          Volver a la lista
        </Button>
      </div>
    </div>
  )
}
