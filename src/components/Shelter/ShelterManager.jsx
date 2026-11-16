import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import Card from '../Card/Card'
import ScreenState from '../ScreenState/ScreenState'
import {
  createShelter,
  deleteShelter,
  getShelters,
  updateShelter,
} from '../../services/shelterService'
import styles from './ShelterManager.module.css'

const EMPTY_FORM = {
  nit: '',
  city: '',
  capacity: '',
  description: '',
  photo: '',
  video: '',
}

export default function ShelterManager() {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const list = await getShelters()
      setShelters(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void load()
}, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  function openEdit(shelter) {
    setEditingId(shelter.id)
    setForm({
      nit: String(shelter.nit ?? ''),
      city: shelter.city || '',
      capacity: shelter.capacity ?? '',
      description: shelter.description || '',
      photo: shelter.photo || '',
      video: shelter.video || '',
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function validate() {
    if (!form.nit.trim()) return 'El NIT es obligatorio'
    if (!/^\d+$/.test(form.nit.trim())) return 'El NIT debe contener solo números'
    if (!form.city.trim()) return 'La ciudad es obligatoria'
    if (!form.capacity || Number(form.capacity) <= 0)
      return 'La capacidad debe ser un número mayor a 0'
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await updateShelter(editingId, form)
        setSuccess('Refugio actualizado correctamente')
      } else {
        await createShelter(form)
        setSuccess('Refugio registrado correctamente')
      }
      cancelForm()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Está seguro de eliminar este refugio?')) return
    setError(null)
    setSuccess(null)
    try {
      await deleteShelter(id)
      setShelters((prev) => prev.filter((s) => s.id !== id))
      setSuccess('Refugio eliminado correctamente')
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = shelters.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      String(s.nit).includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>HU13 · Gestionar refugios</h1>
          <p className={styles.subtitle}>
            Registra, consulta, actualiza y elimina refugios para mantener
            actualizada la información de los lugares donde se encuentran las
            mascotas.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openCreate}>Registrar refugio</Button>
        )}
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

      {showForm && (
        <Card title={editingId ? 'Actualizar refugio' : 'Registrar nuevo refugio'}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="nit">NIT *</label>
                <input
                  id="nit"
                  name="nit"
                  value={form.nit}
                  onChange={handleChange}
                  placeholder="900123456"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="city">Ciudad *</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Bogotá"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="capacity">Capacidad *</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="40"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="description">Descripción</label>
                <input
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Refugio para perros y gatos"
                />
              </div>
            </div>
            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={cancelForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Guardando...'
                  : editingId
                    ? 'Actualizar refugio'
                    : 'Guardar refugio'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!showForm && (
        <>
          <div className={styles.searchBar}>
            <input
              type="search"
              placeholder="Buscar por NIT, ciudad o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar refugios"
            />
          </div>

          <Card>
            {loading ? (
              <ScreenState state="loading" />
            ) : filtered.length === 0 ? (
              <ScreenState
                state="empty"
                message="No hay refugios registrados."
              />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>NIT</th>
                      <th>Ciudad</th>
                      <th>Capacidad</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td className={styles.code}>{s.nit}</td>
                        <td className={styles.name}>{s.city}</td>
                        <td>{s.capacity}</td>
                        <td>{s.description || '—'}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <Button variant="secondary" onClick={() => openEdit(s)}>
                              Actualizar
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(s.id)}>
                              Eliminar
                            </Button>
                            <Link
                              to={`/shelters/${s.id}/veterinarians`}
                              className={styles.vetLink}
                            >
                              Veterinarios
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {!loading && filtered.length > 0 && (
            <p className={styles.footnote}>
              Mostrando {filtered.length} refugio(s). No se puede eliminar un
              refugio con mascotas o procesos activos asociados.
            </p>
          )}
        </>
      )}
    </div>
  )
}
