
import { useEffect, useMemo, useState } from 'react'
import { trialRequestsApi } from '../../api/trialRequests'
import styles from './TrialRequestsManagementPage.module.css'

function normalize(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getRelatedName(value) {
  if (value && typeof value === 'object') {
    return value.name || value.nombre || value.fullName || value.email || 'No disponible'
  }

  return value || 'No disponible'
}

function getRelatedId(value) {
  return value && typeof value === 'object' ? value.id : value
}

function getAdopterName(trial) {
  return (
    trial.adopterName ||
    trial.adopter?.name ||
    trial.adopter?.nombre ||
    trial.adopter?.fullName ||
    'No disponible'
  )
}

function getPetName(trial) {
  return (
    trial.petName ||
    trial.pet?.name ||
    trial.pet?.nombre ||
    'No disponible'
  )
}

function getShelterName(trial) {
  return (
    trial.shelterName ||
    trial.shelter?.name ||
    trial.shelter?.nombre ||
    getRelatedName(trial.shelter)
  )
}

function getTrialStatus(trial) {
  return normalize(trial.status || trial.estado || 'PENDIENTE')
}

function isActive(trial) {
  return ['ACTIVA', 'ACTIVE'].includes(getTrialStatus(trial))
}

function formatDate(value) {
  if (!value) return 'No disponible'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'No disponible'

  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getErrorMessage(error) {
  return error?.message || 'No fue posible completar la operación.'
}

export default function TrialRequestsManagementPage() {
  const [trials, setTrials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [shelterFilter, setShelterFilter] = useState('TODOS')
  const [selectedTrial, setSelectedTrial] = useState(null)
  const [editingTrial, setEditingTrial] = useState(null)
  const [saving, setSaving] = useState(false)

  async function loadTrials() {
    setLoading(true)
    setError('')

    try {
      const data = await trialRequestsApi.list()
      setTrials(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const data = await trialRequestsApi.list()

        if (mounted) {
          setTrials(Array.isArray(data) ? data : [])
        }
      } catch (requestError) {
        if (mounted) {
          setError(getErrorMessage(requestError))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      mounted = false
    }
  }, [])

  const shelters = useMemo(() => {
    return [
      ...new Set(
        trials
          .map(getShelterName)
          .filter((name) => name !== 'No disponible'),
      ),
    ]
  }, [trials])

  const filteredTrials = useMemo(() => {
    return trials.filter((trial) => {
      const searchValue = normalize(search)
      const matchesSearch =
        !searchValue ||
        normalize(getAdopterName(trial)).includes(searchValue) ||
        normalize(getPetName(trial)).includes(searchValue)

      const matchesStatus =
        statusFilter === 'TODOS' ||
        getTrialStatus(trial) === statusFilter

      const matchesShelter =
        shelterFilter === 'TODOS' ||
        getShelterName(trial) === shelterFilter

      return matchesSearch && matchesStatus && matchesShelter
    })
  }, [trials, search, statusFilter, shelterFilter])

  async function handleFinish(trial) {
    if (!isActive(trial)) return

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas finalizar este periodo de prueba?',
    )

    if (!confirmed) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await trialRequestsApi.update(trial.id, {
        ...trial,
        status: 'FINALIZADA',
      })

      setNotice('Periodo de prueba finalizado correctamente.')
      await loadTrials()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editingTrial) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await trialRequestsApi.update(editingTrial.id, {
        ...editingTrial,
      })

      setNotice('Periodo de prueba actualizado correctamente.')
      setEditingTrial(null)
      await loadTrials()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className={styles.page}>
        <p role="status">Cargando periodos de prueba...</p>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>GESTIÓN DE ADOPCIONES</p>
          <h1>HU06 · Gestionar periodos de prueba</h1>
          <p className={styles.subtitle}>
            Consulta, actualiza y finaliza los periodos de prueba registrados.
          </p>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
          <button type="button" onClick={loadTrials}>
            Reintentar
          </button>
        </div>
      )}

      {notice && (
        <div className={styles.success} role="status">
          {notice}
        </div>
      )}

      <section className={styles.filters} aria-label="Filtros de búsqueda">
        <label className={styles.field}>
          Buscar adoptante o mascota
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Escribe un nombre..."
          />
        </label>

        <label className={styles.field}>
          Estado
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Activa</option>
            <option value="ACTIVE">Active</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="PENDIENTE">Pendiente</option>
          </select>
        </label>

        <label className={styles.field}>
          Refugio
          <select
            value={shelterFilter}
            onChange={(event) => setShelterFilter(event.target.value)}
          >
            <option value="TODOS">Todos los refugios</option>
            {shelters.map((shelter) => (
              <option key={shelter} value={shelter}>
                {shelter}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Periodos registrados</h2>
          <span>{filteredTrials.length} resultados</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Adoptante</th>
                <th>Mascota</th>
                <th>Refugio</th>
                <th>Fecha de inicio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrials.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.empty}>
                    No se encontraron periodos de prueba.
                  </td>
                </tr>
              ) : (
                filteredTrials.map((trial) => {
                  const active = isActive(trial)

                  return (
                    <tr key={trial.id}>
                      <td>{trial.trialId || `#${trial.id}`}</td>
                      <td>{getAdopterName(trial)}</td>
                      <td>{getPetName(trial)}</td>
                      <td>{getShelterName(trial)}</td>
                      <td>{formatDate(trial.date || trial.startDate)}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            active ? styles.active : styles.finished
                          }`}
                        >
                          {getTrialStatus(trial)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.detailButton}
                            onClick={() => setSelectedTrial(trial)}
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            className={styles.editButton}
                            disabled={!active || saving}
                            onClick={() => setEditingTrial({ ...trial })}
                          >
                            Actualizar
                          </button>

                          <button
                            type="button"
                            className={styles.finishButton}
                            disabled={!active || saving}
                            onClick={() => handleFinish(trial)}
                          >
                            Finalizar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTrial && (
        <div className={styles.modalBackdrop}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <h2 id="detail-title">Detalle del periodo de prueba</h2>
            <p><strong>Solicitud:</strong> {selectedTrial.trialId || selectedTrial.id}</p>
            <p><strong>Adoptante:</strong> {getAdopterName(selectedTrial)}</p>
            <p><strong>Mascota:</strong> {getPetName(selectedTrial)}</p>
            <p><strong>Refugio:</strong> {getShelterName(selectedTrial)}</p>
            <p><strong>Fecha de inicio:</strong> {formatDate(selectedTrial.date || selectedTrial.startDate)}</p>
            <p><strong>Estado:</strong> {getTrialStatus(selectedTrial)}</p>
            <p><strong>Descripción:</strong> {selectedTrial.description || 'Sin descripción'}</p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setSelectedTrial(null)}
            >
              Cerrar
            </button>
          </section>
        </div>
      )}

      {editingTrial && (
        <div className={styles.modalBackdrop}>
          <form
            className={styles.modal}
            onSubmit={handleUpdate}
            aria-labelledby="edit-title"
          >
            <h2 id="edit-title">Actualizar periodo de prueba</h2>

            <label className={styles.field}>
              Fecha de inicio
              <input
                type="date"
                value={String(editingTrial.date || editingTrial.startDate || '').slice(0, 10)}
                onChange={(event) =>
                  setEditingTrial({
                    ...editingTrial,
                    date: `${event.target.value}T00:00:00.000Z`,
                  })
                }
                required
              />
            </label>

            <label className={styles.field}>
              Descripción
              <textarea
                value={editingTrial.description || ''}
                onChange={(event) =>
                  setEditingTrial({
                    ...editingTrial,
                    description: event.target.value,
                  })
                }
                rows="4"
              />
            </label>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setEditingTrial(null)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
