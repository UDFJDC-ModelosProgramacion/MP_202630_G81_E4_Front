import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import { CURRENT_USER } from '../../config/currentUser'
import { getAdopter } from '../../services/adopterService'
import {
  REQUEST_STATUS,
  createAdoptionRequest,
  listAdoptionRequests,
  listPets,
} from '../../services/adoptionRequestService'
import { formatShortDate, todayISO } from '../../utils/dates'
import styles from './AdoptionRequestPage.module.css'

const ADOPTER_ID = CURRENT_USER.adopterId

const STATUS_TONE = {
  [REQUEST_STATUS.PENDING]: 'warning',
  [REQUEST_STATUS.APPROVED]: 'success',
  [REQUEST_STATUS.CANCELLED]: 'neutral',
}

function petLabel(pet) {
  const status = pet.adoptionStatus === 'DISPONIBLE' ? 'Disponible' : 'Adoptada'
  return `${pet.name} · ${pet.breed} · ${pet.age} años · ${pet.shelter} · ${status}`
}

// HU02 - Registrar solicitud de adopción.
// Optional: /adoptions/new?petId=1 opens the form with that pet already chosen
// (the "Solicitar adopción" button of the pet detail can link here).
export default function AdoptionRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loadState, setLoadState] = useState('loading')
  const [adopter, setAdopter] = useState(null)
  const [pets, setPets] = useState([])
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({
    petId: searchParams.get('petId') ?? '',
    dateRequest: todayISO(),
    description: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getAdopter(ADOPTER_ID), listPets(), listAdoptionRequests(ADOPTER_ID)])
      .then(([loadedAdopter, loadedPets, loadedRequests]) => {
        if (!active) return
        setAdopter(loadedAdopter)
        setPets(loadedPets)
        setRequests(loadedRequests)
        setLoadState('ready')
      })
      .catch(() => {
        if (active) setLoadState('error')
      })
    return () => {
      active = false
    }
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const created = await createAdoptionRequest({
        adopterId: ADOPTER_ID,
        petId: form.petId ? Number(form.petId) : null,
        dateRequest: form.dateRequest,
        description: form.description,
      })
      setRequests((current) => [created, ...current])
      setForm({ petId: '', dateRequest: todayISO(), description: '' })
      setSuccess(`Solicitud registrada para ${created.pet.name}.`)
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  if (loadState === 'loading') return <ScreenState state="loading" />
  if (loadState === 'error') return <ScreenState state="error" />

  return (
    <>
      <h1>Registrar solicitud de adopción</h1>
      <p className={styles.subtitle}>Completa los datos para solicitar la adopción de una mascota.</p>

      <div className={styles.layout}>
        <Card title="Nueva solicitud">
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="request-pet">
                Mascota <span className={styles.required}>*</span>
              </label>
              <select
                id="request-pet"
                name="petId"
                value={form.petId}
                onChange={handleChange}
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {petLabel(pet)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="request-adopter">Adoptante</label>
              <input
                id="request-adopter"
                value={`${adopter.name} (ID ${adopter.id})`}
                readOnly
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="request-date">
                  Fecha de solicitud <span className={styles.required}>*</span>
                </label>
                <input
                  id="request-date"
                  name="dateRequest"
                  type="date"
                  value={form.dateRequest}
                  onChange={handleChange}
                />
                <p className={styles.help}>Obligatoria</p>
              </div>
              <div className={styles.field}>
                <label htmlFor="request-status">Estado</label>
                <input id="request-status" value={REQUEST_STATUS.PENDING} readOnly />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="request-description">Descripción</label>
              <textarea
                id="request-description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className={styles.success} role="status">
                {success}
              </p>
            )}

            <div className={styles.actions}>
              <Button type="submit">Enviar solicitud</Button>
              <Button variant="secondary" onClick={() => navigate('/adoptions')}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Mis solicitudes">
          {requests.length === 0 ? (
            <ScreenState state="empty" message="Aún no tienes solicitudes." />
          ) : (
            <ul className={styles.list}>
              {requests.map((request) => (
                <li key={request.id} className={styles.request}>
                  <span>
                    <strong>{request.pet.name}</strong>
                    <span className={styles.date}>
                      Solicitada el {request.dateRequest} ({formatShortDate(request.dateRequest)})
                    </span>
                  </span>
                  <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.info}>
            No se puede solicitar una mascota que ya fue adoptada ni tener más de una solicitud
            pendiente por mascota.
          </p>
        </Card>
      </div>
    </>
  )
}
