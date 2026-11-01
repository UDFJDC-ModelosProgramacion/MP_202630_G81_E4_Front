import { useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import { validateVeterinarian } from './validateVeterinarian'
import styles from './VeterinarianForm.module.css'

const FIELDS = [
  { name: 'name', label: 'Nombre', placeholder: 'Nombre completo' },
  { name: 'license', label: 'Licencia', placeholder: 'Número de licencia' },
  { name: 'phone', label: 'Teléfono', placeholder: 'Teléfono de contacto' },
]

const EMPTY_VALUES = { name: '', license: '', phone: '' }

export default function VeterinarianForm({ initialValues = null, onSubmit, onCancel }) {
  const isEditing = initialValues !== null
  const [values, setValues] = useState(
    isEditing
      ? {
          name: initialValues.name,
          license: initialValues.license,
          phone: initialValues.phone,
        }
      : EMPTY_VALUES,
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateVeterinarian(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title={isEditing ? 'Editar veterinario' : 'Registrar veterinario'}>
      <form onSubmit={handleSubmit} noValidate>
        {FIELDS.map(({ name, label, placeholder }) => (
          <div key={name} className={styles.field}>
            <label htmlFor={`veterinarian-${name}`}>{label} *</label>
            <input
              id={`veterinarian-${name}`}
              name={name}
              value={values[name]}
              onChange={handleChange}
              placeholder={placeholder}
              aria-invalid={Boolean(errors[name])}
            />
            {errors[name] && (
              <p className={styles.error} role="alert">
                {errors[name]}
              </p>
            )}
          </div>
        ))}

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={submitting}>
            {isEditing ? 'Guardar cambios' : 'Registrar'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        <p className={styles.note}>
          * Campos obligatorios. El veterinario queda asociado a este refugio.
        </p>
      </form>
    </Card>
  )
}