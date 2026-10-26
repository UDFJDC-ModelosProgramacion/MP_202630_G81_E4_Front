
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adoptionRequestsApi } from '../../api/adoptionRequests'
import styles from './AdoptionRequestsPage.module.css'

const STATUS = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobada',
  APROBADA: 'Aprobada',
  CANCELADO: 'Cancelada',
  CANCELADA: 'Cancelada',
}

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

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeZone: 'UTC',
      }).format(date)
}

function normalizeStatus(status) {
  if (status === 'APROBADA') return 'APROBADO'
  if (status === 'CANCELADA') return 'CANCELADO'

  return status
}

export default function AdoptionRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [petFilter, setPetFilter] = useState('TODAS')
  const [editing, setEditing] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const loadRequests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setLoadError('')

    try {
      const data = await adoptionRequestsApi.list()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      setLoadError(error.message)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    adoptionRequestsApi.list()
      .then((data) => {
        if (active) {
          setRequests(Array.isArray(data) ? data : [])
          setLoadError('')
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const pets = useMemo(() => {
    const values = requests.map((item) => ({
      id: item.pet?.id ?? displayPet(item.pet),
      label: displayPet(item.pet),
    }))

    return [...new Map(values.map((pet) => [String(pet.id), pet])).values()]
  }, [requests])

  const filtered = useMemo(
    () =>
      requests.filter((item) => {
        const term = search.trim().toLocaleLowerCase('es')

        const textMatches =
          !term ||
          `${displayName(item.adopter)} ${displayPet(item.pet)} ${
            item.requestId ?? item.id ?? ''
          }`
            .toLocaleLowerCase('es')
            .includes(term)

        const statusMatches =
          statusFilter === 'TODOS' ||
          normalizeStatus(item.status) === statusFilter

        const petMatches =
          petFilter === 'TODAS' ||
          String(item.pet?.id ?? displayPet(item.pet)) === petFilter

        return textMatches && statusMatches && petMatches
      }),
    [requests, search, statusFilter, petFilter],
  )

  async function changeStatus(item, status) {
    setActionError('')
    setNotice('')
    setBusyId(item.id)

    try {
      await adoptionRequestsApi.update(item.id, {
        id: item.id,
        requestId: item.requestId,
        dateRequest: item.dateRequest,
        status,
        description: item.description ?? '',
        adopter: item.adopter?.id
          ? { id: item.adopter.id }
          : item.adopter,
        pet: item.pet?.id ? { id: item.pet.id } : item.pet,
      })

      setNotice(
        status === 'APROBADO'
          ? 'Solicitud aprobada correctamente.'
          : 'Solicitud cancelada correctamente.',
      )

      await loadRequests(false)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  function startEdit(item) {
    setActionError('')
    setNotice('')
    setEditing(item)
    setEditDate(
      item.dateRequest ? String(item.dateRequest).slice(0, 10) : '',
    )
    setEditDescription(item.description ?? '')
  }

  async function saveEdit(event) {
    event.preventDefault()

    if (!editing || !editDate) return

    setActionError('')
    setNotice('')
    setBusyId(editing.id)

    try {
      await adoptionRequestsApi.update(editing.id, {
        id: editing.id,
        requestId: editing.requestId,
        dateRequest: `${editDate}T00:00:00.000Z`,
        status: normalizeStatus(editing.status),
        description: editDescription,
        adopter: editing.adopter?.id
          ? { id: editing.adopter.id }
          : editing.adopter,
        pet: editing.pet?.id ? { id: editing.pet.id } : editing.pet,
      })

      setEditing(null)
      setNotice('Solicitud actualizada correctamente.')
      await loadRequests(false)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>GESTIÓN DEL REFUGIO</p>
          <h1>HU03 · Gestionar solicitudes de adopción</h1>
          <p className={styles.subtitle}>
            Aprueba, cancela o actualiza las solicitudes recibidas.
          </p>
        </div>

        <button
          className={styles.secondaryButton}
          onClick={() => loadRequests()}
          disabled={loading}
        >
          Actualizar lista
        </button>
      </div>

      <div className={styles.filters} aria-label="Filtros de solicitudes">
        <label className={styles.searchField}>
          Buscar
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Adoptante, mascota o código"
          />
        </label>

        <label>
          Estado
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobada</option>
            <option value="CANCELADO">Cancelada</option>
          </select>
        </label>

        <label>
          Mascota
          <select
            value={petFilter}
            onChange={(event) => setPetFilter(event.target.value)}
          >
            <option value="TODAS">Todas las mascotas</option>
            {pets.map((pet) => (
              <option key={pet.id} value={String(pet.id)}>
                {pet.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      {editing && (
        <form className={styles.editPanel} onSubmit={saveEdit}>
          <h2>
            Editar solicitud {editing.requestId || `#${editing.id}`}
          </h2>

          <p>
            Adoptante: {displayName(editing.adopter)} · Mascota:{' '}
            {displayPet(editing.pet)}
          </p>

          <div className={styles.editFields}>
            <label>
              Fecha de solicitud *
              <input
                type="date"
                value={editDate}
                onChange={(event) => setEditDate(event.target.value)}
                required
              />
            </label>

            <label>
              Descripción
              <input
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              disabled={busyId === editing.id || !editDate}
            >
              {busyId === editing.id ? 'Guardando…' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setEditing(null)}
            >
              Cancelar edición
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.state} role="status">
            Cargando solicitudes…
          </p>
        ) : loadError ? (
          <div className={styles.state}>
            <p className={styles.errorText}>{loadError}</p>
            <button onClick={() => loadRequests()}>Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <p className={styles.state}>
            No se encontraron solicitudes con esos filtros.
          </p>
        ) : (
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Adoptante</th>
                  <th>Mascota</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const status = normalizeStatus(item.status)
                  const pending = status === 'PENDIENTE'

                  return (
                    <tr key={item.id}>
                      <td className={styles.requestCode}>
                        {item.requestId ||
                          `REQ-${String(item.id).padStart(3, '0')}`}
                      </td>
                      <td>{displayName(item.adopter)}</td>
                      <td>{displayPet(item.pet)}</td>
                      <td>{formatDate(item.dateRequest)}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[status?.toLowerCase()] || ''
                          }`}
                        >
                          {STATUS[status] || item.status || 'Sin estado'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {pending ? (
                            <>
                              <button
                                onClick={() => changeStatus(item, 'APROBADO')}
                                disabled={busyId === item.id}
                              >
                                {busyId === item.id
                                  ? 'Procesando…'
                                  : 'Aprobar'}
                              </button>

                              <button
                                className={styles.dangerButton}
                                onClick={() =>
                                  changeStatus(item, 'CANCELADO')
                                }
                                disabled={busyId === item.id}
                              >
                                Cancelar
                              </button>

                              <button
                                className={styles.secondaryButton}
                                onClick={() => startEdit(item)}
                                disabled={busyId === item.id}
                              >
                                Editar
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.secondaryButton}
                              onClick={() =>
                                setNotice(
                                  `${item.requestId || `Solicitud #${item.id}`} · ${displayName(item.adopter)} · ${displayPet(item.pet)} · ${STATUS[status] || item.status}`,
                                )
                              }
                            >
                              Ver detalle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className={styles.footnote}>
        Mostrando {filtered.length} de {requests.length} solicitudes. Las
        solicitudes canceladas no se pueden modificar.
      </p>
    </section>
  )
}
