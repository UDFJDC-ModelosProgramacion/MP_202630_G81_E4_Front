
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adoptionRequestsApi } from '../../api/adoptionRequests'
import { adoptionsApi } from '../../api/adoptions'
import styles from './AdoptionsPage.module.css'

function displayName(value) {
  if (!value) return '—'
  if (typeof value === 'string') return value

  return (
    value.name ||
    value.fullName ||
    [value.firstName, value.lastName].filter(Boolean).join(' ') ||
    value.nombre ||
    `ID ${value.id ?? ''}`.trim()
  )
}

function displayPet(value) {
  if (!value) return '—'
  if (typeof value === 'string') return value

  return value.name || value.nombre || `Mascota ID ${value.id ?? ''}`.trim()
}

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase()
}

function createAdoptionId() {
  return `AD-${Date.now()}`
}

export default function AdoptionsPage() {
  const [requests, setRequests] = useState([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [adoptionDate, setAdoptionDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  // Consultar solicitudes aprobadas
  const loadRequests = useCallback(async () => {
    try {
      const data = await adoptionRequestsApi.list()

      const approvedRequests = Array.isArray(data)
        ? data.filter(
            (item) => normalizeStatus(item.status) === 'APROBADO',
          )
        : []

      setRequests(approvedRequests)
      setLoadError('')

      setSelectedRequestId((current) => {
        const stillExists = approvedRequests.some(
          (item) => String(item.id) === current,
        )

        return stillExists
          ? current
          : approvedRequests.length > 0
            ? String(approvedRequests[0].id)
            : ''
      })
    } catch (error) {
      setLoadError(error.message)
      setRequests([])
      setSelectedRequestId('')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    let active = true

    const timer = setTimeout(() => {
      if (active) {
        loadRequests()
      }
    }, 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [loadRequests])

  // Obtener solicitud seleccionada
  const selectedRequest = useMemo(
    () =>
      requests.find(
        (item) => String(item.id) === selectedRequestId,
      ) || null,
    [requests, selectedRequestId],
  )

  const adopter = selectedRequest?.adopter
  const pet = selectedRequest?.pet
  const shelter = pet?.shelter

  // Información de la mascota
  const petDetails = pet
    ? [
        displayPet(pet),
        pet.specie,
        pet.breed,
        pet.age != null ? `${pet.age} años` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '—'

  // Registrar adopción
  async function handleSubmit(event) {
    event.preventDefault()

    setActionError('')
    setNotice('')

    if (!selectedRequest) {
      setActionError('Debes seleccionar una solicitud aprobada.')
      return
    }

    if (!adopter?.id || !pet?.id) {
      setActionError(
        'La solicitud seleccionada no tiene un adoptante o una mascota válidos.',
      )
      return
    }

    if (!adoptionDate) {
      setActionError('Debes seleccionar la fecha de adopción.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        adoptionId: createAdoptionId(),
        status: 'ACTIVA',
        date: `${adoptionDate}T00:00:00.000Z`,
        adopter: { id: adopter.id },
        pet: { id: pet.id },
      }

      await adoptionsApi.create(payload)

      setNotice('Adopción registrada correctamente.')

      await loadRequests()
    } catch (error) {
      setActionError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Cancelar formulario
  function handleCancel() {
    setActionError('')
    setNotice('')
    setSelectedRequestId('')
    setAdoptionDate(new Date().toISOString().slice(0, 10))
  }

  // Estado de carga inicial
  if (loading) {
    return (
      <section className={styles.page}>
        <p role="status">Cargando solicitudes aprobadas...</p>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>GESTIÓN DEL REFUGIO</p>

          <h1>HU04 · Registrar adopción</h1>

          <p className={styles.subtitle}>
            Formaliza la entrega de una mascota a partir de una solicitud
            aprobada.
          </p>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={loadRequests}
          disabled={saving}
        >
          Actualizar solicitudes
        </button>
      </header>

      {/* Error de carga */}
      {loadError && (
        <div className={styles.error} role="alert">
          <span>{loadError}</span>

          <button type="button" onClick={loadRequests}>
            Reintentar
          </button>
        </div>
      )}

      {/* Error de registro */}
      {actionError && (
        <div className={styles.error} role="alert">
          {actionError}
        </div>
      )}

      {/* Confirmación */}
      {notice && (
        <div className={styles.success} role="status">
          {notice}
        </div>
      )}

      {/* Solicitudes disponibles */}
      {!loadError && requests.length === 0 ? (
        <div className={styles.empty}>
          <h2>No hay solicitudes aprobadas</h2>

          <p>
            Para registrar una adopción debe existir una solicitud de
            adopción aprobada.
          </p>
        </div>
      ) : (
        <form className={styles.content} onSubmit={handleSubmit}>
          <div className={styles.formCard}>
            <h2>Datos de la adopción</h2>

            <label className={styles.field}>
              Solicitud aprobada

              <select
                value={selectedRequestId}
                onChange={(event) => {
                  setSelectedRequestId(event.target.value)
                  setActionError('')
                  setNotice('')
                }}
                disabled={saving}
                required
              >
                <option value="">Selecciona una solicitud</option>

                {requests.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.requestId ||
                      `REQ-${String(item.id).padStart(3, '0')}`}
                    {' · '}
                    {displayName(item.adopter)}
                    {' · '}
                    {displayPet(item.pet)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              Adoptante

              <input
                value={displayName(adopter)}
                readOnly
                placeholder="Se mostrará al seleccionar una solicitud"
              />
            </label>

            <label className={styles.field}>
              Mascota

              <input
                value={petDetails}
                readOnly
                placeholder="Se mostrará al seleccionar una solicitud"
              />
            </label>

            <div className={styles.fieldsRow}>
              <label className={styles.field}>
                Fecha de adopción

                <input
                  type="date"
                  value={adoptionDate}
                  onChange={(event) => setAdoptionDate(event.target.value)}
                  disabled={saving}
                  required
                />
              </label>

              <div className={styles.field}>
                Estado

                <div className={styles.status}>
                  <span>ACTIVA</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  saving ||
                  !selectedRequest ||
                  !adoptionDate ||
                  !adopter?.id ||
                  !pet?.id
                }
              >
                {saving ? 'Registrando...' : 'Registrar adopción'}
              </button>
            </div>
          </div>

          {/* Resumen de la adopción */}
          <aside className={styles.summaryCard}>
            <div className={styles.petImage}>
              {pet?.photo ? (
                <img src={pet.photo} alt={displayPet(pet)} />
              ) : (
                <span aria-label="Mascota">🐱</span>
              )}
            </div>

            <h2>Resumen de la adopción</h2>

            <div className={styles.summaryRow}>
              <span>Adoptante</span>
              <strong>{displayName(adopter)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Mascota</span>
              <strong>{displayPet(pet)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Refugio</span>

              <strong>
                {shelter?.name || shelter?.nombre || '—'}
              </strong>
            </div>

            <ul className={styles.checkList}>
              <li>
                {selectedRequest
                  ? 'Solicitud de adopción aprobada'
                  : 'Selecciona una solicitud aprobada'}
              </li>

              <li>
                {adopter?.id
                  ? 'Adoptante identificado'
                  : 'Adoptante pendiente de selección'}
              </li>

              <li>
                {pet?.id
                  ? 'Mascota identificada'
                  : 'Mascota pendiente de selección'}
              </li>
            </ul>
          </aside>
        </form>
      )}

      <p className={styles.helper}>
        La creación de la adopción está sujeta a las validaciones de negocio
        realizadas por el backend.
      </p>
    </section>
  )
}
