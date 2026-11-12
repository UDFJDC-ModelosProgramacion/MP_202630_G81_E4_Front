
import { useEffect, useMemo, useState } from 'react'
import { CURRENT_USER } from '../../config/currentUser'
import { getAvailablePets } from '../../services/petService'
import { getShelters } from '../../services/shelterService'
import { trialRequestsApi } from '../../api/trialRequests'
import styles from './TrialRequestPage.module.css'

function normalize(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getPetName(pet) {
  return pet?.name || pet?.nombre || `Mascota ${pet?.id ?? ''}`
}

function getShelterName(shelter) {
  return shelter?.name || shelter?.nombre || ''
}

function getPetShelterName(pet) {
  return typeof pet?.shelter === 'string'
    ? pet.shelter
    : getShelterName(pet?.shelter)
}

function isActiveTrial(trial) {
  return ['ACTIVA', 'ACTIVE'].includes(normalize(trial?.status))
}

function getRelatedId(value) {
  if (value && typeof value === 'object') return value.id
  return value
}

function getTrialAdopterId(trial) {
  return getRelatedId(trial?.adopter) ?? trial?.adopterId
}

function getTrialPetId(trial) {
  return getRelatedId(trial?.pet) ?? trial?.petId
}

function getErrorMessage(error) {
  return error?.message || 'No fue posible completar la solicitud.'
}

export default function TrialRequestPage() {
  const [pets, setPets] = useState([])
  const [shelters, setShelters] = useState([])
  const [trials, setTrials] = useState([])
  const [petId, setPetId] = useState('')
  const [shelterId, setShelterId] = useState('')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [description, setDescription] = useState(
    'Periodo de prueba de 15 días para evaluar la convivencia.',
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    async function loadData() {
      // allSettled: si falla la lista de periodos (backend sin conexión),
      // la mascota y el refugio igual cargan y el formulario sigue usable.
      const [petsResult, sheltersResult, trialsResult] = await Promise.allSettled([
        getAvailablePets(),
        getShelters(),
        trialRequestsApi.list(),
      ])

      if (!active) return

      if (petsResult.status === 'fulfilled') {
        setPets(Array.isArray(petsResult.value) ? petsResult.value : [])
        setLoadError('')
      } else {
        setLoadError(getErrorMessage(petsResult.reason))
      }

      if (sheltersResult.status === 'fulfilled') {
        setShelters(Array.isArray(sheltersResult.value) ? sheltersResult.value : [])
      }

      if (trialsResult.status === 'fulfilled') {
        setTrials(Array.isArray(trialsResult.value) ? trialsResult.value : [])
      }

      setLoading(false)
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  const selectedPet = useMemo(
    () => pets.find((pet) => String(pet.id) === petId) || null,
    [pets, petId],
  )

  const selectedShelter = useMemo(
    () => shelters.find((shelter) => String(shelter.id) === shelterId) || null,
    [shelters, shelterId],
  )

  const petShelterName = getPetShelterName(selectedPet)

  const matchingShelter = shelters.find(
    (shelter) =>
      normalize(getShelterName(shelter)) === normalize(petShelterName),
  )

  function clearMessages() {
    setActionError('')
    setNotice('')
  }

  function handlePetChange(event) {
    const nextPetId = event.target.value
    setPetId(nextPetId)
    clearMessages()

    const nextPet = pets.find((pet) => String(pet.id) === nextPetId)
    const nextShelterName = getPetShelterName(nextPet)
    const nextShelter = shelters.find(
      (shelter) =>
        normalize(getShelterName(shelter)) === normalize(nextShelterName),
    )

    if (nextShelter) setShelterId(String(nextShelter.id))
  }

  function validateRequest() {
    if (!CURRENT_USER?.adopterId) {
      return 'No se pudo identificar un adoptante válido.'
    }

    if (!selectedPet) {
      return 'Debes seleccionar una mascota válida.'
    }

    if (!selectedShelter) {
      return 'Debes seleccionar un refugio.'
    }

    if (!startDate) {
      return 'Debes seleccionar la fecha de inicio.'
    }

    if (normalize(selectedPet.adoptionStatus) === 'ADOPTADA') {
      return 'No se puede solicitar un periodo de prueba para una mascota que ya fue adoptada.'
    }

    const activeTrials = trials.filter(isActiveTrial)

    const adopterHasActiveTrial = activeTrials.some(
      (trial) =>
        String(getTrialAdopterId(trial)) ===
        String(CURRENT_USER.adopterId),
    )

    if (adopterHasActiveTrial) {
      return 'Solo puedes tener un periodo de prueba activo a la vez.'
    }

    const petHasActiveTrial = activeTrials.some(
      (trial) => String(getTrialPetId(trial)) === String(selectedPet.id),
    )

    if (petHasActiveTrial) {
      return 'Esta mascota ya tiene un periodo de prueba activo con otro adoptante.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    clearMessages()

    const validationError = validateRequest()

    if (validationError) {
      setActionError(validationError)
      return
    }

    setSaving(true)

    try {
      const payload = {
        date: `${startDate}T00:00:00.000Z`,
        status: 'ACTIVA',
        description: description.trim(),
        adopter: { id: CURRENT_USER.adopterId },
        shelter: { id: selectedShelter.id },
        pet: { id: selectedPet.id },
      }

      await trialRequestsApi.create(payload)

      setNotice('Periodo de prueba solicitado correctamente.')

      const updatedTrials = await trialRequestsApi.list()
      setTrials(Array.isArray(updatedTrials) ? updatedTrials : [])
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setPetId('')
    setShelterId('')
    setStartDate(new Date().toISOString().slice(0, 10))
    setDescription('')
    clearMessages()
  }

  if (loading) {
    return (
      <section className={styles.page}>
        <p role="status">Cargando información para la solicitud...</p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className={styles.page}>
        <div className={styles.error} role="alert">
          {loadError}
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>SOLICITUDES</p>
          <h1>HU05 · Solicitar periodo de prueba</h1>
          <p className={styles.subtitle}>
            Evalúa la convivencia con una mascota antes de formalizar una adopción.
          </p>
        </div>
      </header>

      {actionError && (
        <div className={styles.error} role="alert">
          {actionError}
        </div>
      )}

      {notice && (
        <div className={styles.success} role="status">
          {notice}
        </div>
      )}

      <div className={styles.content}>
        <aside className={styles.petCard}>
          <div className={styles.petImage} aria-label="Imagen de mascota">
            {selectedPet?.species?.toLowerCase() === 'gato' ? '🐱' : '🐶'}
          </div>

          {selectedPet ? (
            <>
              <h2>{getPetName(selectedPet)}</h2>
              <p className={styles.petDescription}>
                {selectedPet.species || selectedPet.specie || 'Mascota'}
                {' · '}
                {selectedPet.breed || 'Raza no especificada'}
                {' · '}
                {selectedPet.age != null
                  ? `${selectedPet.age} ${Number(selectedPet.age) === 1 ? 'año' : 'años'}`
                  : 'Edad no especificada'}
              </p>
              <span className={styles.available}>Disponible</span>

              <dl className={styles.details}>
                <div>
                  <dt>Refugio</dt>
                  <dd>{getShelterName(matchingShelter) || petShelterName || '—'}</dd>
                </div>
                <div>
                  <dt>Peso</dt>
                  <dd>{selectedPet.weight ? `${selectedPet.weight} kg` : '—'}</dd>
                </div>
                <div>
                  <dt>Estado de salud</dt>
                  <dd>{selectedPet.healthStatus || '—'}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className={styles.placeholder}>
              Selecciona una mascota para consultar su información.
            </p>
          )}
        </aside>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>Datos de la solicitud</h2>

          <div className={styles.info}>
            Solo puedes tener un periodo de prueba activo a la vez.
          </div>

          <div className={styles.fieldsRow}>
            <label className={styles.field}>
              Mascota
              <select
                value={petId}
                onChange={handlePetChange}
                disabled={saving}
                required
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={String(pet.id)}>
                    {getPetName(pet)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              Refugio
              <select
                value={shelterId}
                onChange={(event) => {
                  setShelterId(event.target.value)
                  clearMessages()
                }}
                disabled={saving}
                required
              >
                <option value="">Selecciona un refugio</option>
                {shelters.map((shelter) => (
                  <option key={shelter.id} value={String(shelter.id)}>
                    {getShelterName(shelter)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            Fecha de inicio
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                clearMessages()
              }}
              disabled={saving}
              required
            />
          </label>

          <label className={styles.field}>
            Descripción
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                clearMessages()
              }}
              rows={4}
              maxLength={500}
              placeholder="Describe el propósito del periodo de prueba..."
              disabled={saving}
            />
          </label>

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
              disabled={saving || pets.length === 0 || shelters.length === 0}
            >
              {saving ? 'Enviando...' : 'Solicitar periodo de prueba'}
            </button>
          </div>
        </form>
      </div>

      <p className={styles.footerNote}>
        La mascota no puede estar adoptada ni tener un periodo de prueba activo con otro adoptante.
      </p>
    </section>
  )
}
