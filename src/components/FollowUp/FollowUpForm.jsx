import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../Button/Button'
import Card from '../Card/Card'
import ScreenState from '../ScreenState/ScreenState'
import {
  createFollowUp,
  getActiveAdoptions,
  getFollowUpById,
  getPets,
  getVets,
  updateFollowUp,
} from '../../services/followUpService'
import styles from './FollowUpForm.module.css'

const EMPTY_FORM = {
  adoptionId: '',
  petId: '',
  vetId: '',
  date: '',
  notes: '',
  status: 'Programado',
}

export default function FollowUpForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [adoptions, setAdoptions] = useState([])
  const [pets, setPets] = useState([])
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [adoptionList, petList, vetList] = await Promise.all([
          getActiveAdoptions(),
          getPets(),
          getVets(),
        ])
        if (cancelled) return
        setAdoptions(adoptionList)
        setPets(petList)
        setVets(vetList)
        if (isEdit) {
          const existing = await getFollowUpById(id)
          if (cancelled) return
          setForm({
            adoptionId: existing.adoptionId || '',
            petId: existing.petId || '',
            vetId: existing.vetId || '',
            date: existing.date || '',
            notes: existing.notes || '',
            status: existing.status || 'Programado',
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validate() {
    if (!form.adoptionId) return 'Seleccione una adopción activa'
    if (!form.petId) return 'Seleccione una mascota'
    if (!form.vetId) return 'Seleccione el veterinario responsable'
    if (!form.date) return 'La fecha de seguimiento es obligatoria'
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
      const payload = {
        adoptionId: form.adoptionId,
        petId: Number(form.petId),
        vetId: Number(form.vetId),
        date: form.date,
        notes: form.notes,
        status: form.status,
      }
      if (isEdit) {
        await updateFollowUp(id, payload)
        setSuccess('Seguimiento actualizado correctamente')
      } else {
        await createFollowUp(payload)
        setSuccess('Seguimiento registrado correctamente')
        setForm(EMPTY_FORM)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setError(null)
    setSuccess(null)
  }

  if (loading) return <ScreenState state="loading" message="Cargando formulario..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>HU07 · {isEdit ? 'Actualizar' : 'Registrar'} seguimiento veterinario</h1>
        <p className={styles.subtitle}>
          Registra y actualiza los seguimientos veterinarios sobre adopciones activas
          para evaluar el estado de la mascota.
        </p>
      </div>

      <Card title="Nuevo registro / actualización de seguimiento">
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="adoptionId">Adopción activa *</label>
              <select
                id="adoptionId"
                name="adoptionId"
                value={form.adoptionId}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                {adoptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} · {a.adopter}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="petId">Mascota *</label>
              <select
                id="petId"
                name="petId"
                value={form.petId}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="vetId">Veterinario responsable *</label>
              <select
                id="vetId"
                name="vetId"
                value={form.vetId}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="date">Fecha de seguimiento *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Programado">Programado</option>
                <option value="Activa">Activa</option>
                <option value="Realizado">Realizado</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="notes">Notas / observaciones</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Ej: Excelente estado físico, peso estable y adaptación favorable en el hogar."
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
            <Button type="button" variant="secondary" onClick={handleReset}>
              Limpiar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Guardando...'
                : isEdit
                  ? 'Actualizar seguimiento'
                  : 'Guardar seguimiento'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/adoptions')}>
              Volver a adopciones
            </Button>
          </div>
        </form>
      </Card>

      <p className={styles.footnote}>
        La adopción, la mascota y el veterinario deben ser válidos. La fecha de
        seguimiento es obligatoria. Permite programar el seguimiento inicial
        requerido para confirmar una adopción como ACTIVA.
      </p>
    </div>
  )
}
