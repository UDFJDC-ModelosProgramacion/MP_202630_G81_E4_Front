import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import {
  createVeterinarian,
  deleteVeterinarian,
  getShelterSummary,
  listVeterinarians,
  updateVeterinarian,
} from '../../services/veterinarianService'
import VeterinarianForm from './VeterinarianForm'
import VeterinarianTable from './VeterinarianTable'
import styles from './VeterinariansPage.module.css'

export default function VeterinariansPage() {
  const { shelterId } = useParams()
  const [shelter, setShelter] = useState(null)
  const [veterinarians, setVeterinarians] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [formVersion, setFormVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([getShelterSummary(shelterId), listVeterinarians(shelterId)])
      .then(([shelterData, list]) => {
        if (cancelled) return
        setShelter(shelterData)
        setVeterinarians(list)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(error.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [shelterId])

  function resetForm() {
    setEditing(null)
    setFormVersion((version) => version + 1)
  }

  async function handleSubmit(values) {
    if (editing) {
      const updated = await updateVeterinarian(shelterId, editing.id, values)
      setVeterinarians((current) =>
        current.map((vet) => (vet.id === updated.id ? updated : vet)),
      )
      setFeedback({ type: 'success', text: 'Veterinario actualizado.' })
    } else {
      const created = await createVeterinarian(shelterId, values)
      setVeterinarians((current) => [...current, created])
      setFeedback({ type: 'success', text: 'Veterinario registrado.' })
    }
    resetForm()
  }

  function handleEdit(veterinarian) {
    setEditing(veterinarian)
    setPendingDelete(null)
    setFeedback(null)
  }

  function handleAskDelete(veterinarian) {
    setPendingDelete(veterinarian)
    setFeedback(null)
  }

  async function handleConfirmDelete() {
    const target = pendingDelete
    try {
      await deleteVeterinarian(shelterId, target.id)
      setVeterinarians((current) => current.filter((vet) => vet.id !== target.id))
      if (editing?.id === target.id) {
        resetForm()
      }
      setFeedback({ type: 'success', text: 'Veterinario eliminado.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    } finally {
      setPendingDelete(null)
    }
  }

  if (status === 'loading') {
    return <ScreenState state="loading" />
  }
  if (status === 'error') {
    return <ScreenState state="error" message={loadError} />
  }

  return (
    <>
      <h1>HU14 · Veterinarios del refugio</h1>
      <p className={styles.subtitle}>Refugio: {shelter.name}</p>

      <div className={styles.columns}>
        <Card title="Veterinarios registrados">
          {pendingDelete && (
            <div className={styles.confirm} role="group" aria-label="Confirmar eliminación">
              <p>¿Eliminar a {pendingDelete.name}?</p>
              <div className={styles.confirmActions}>
                <Button variant="danger" onClick={handleConfirmDelete}>
                  Confirmar eliminación
                </Button>
                <Button variant="secondary" onClick={() => setPendingDelete(null)}>
                  Conservar
                </Button>
              </div>
            </div>
          )}

          <VeterinarianTable
            veterinarians={veterinarians}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
          />

          {feedback && (
            <p
              className={feedback.type === 'error' ? styles.error : styles.success}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.text}
            </p>
          )}
        </Card>

        <VeterinarianForm
          key={`${editing?.id ?? 'new'}-${formVersion}`}
          initialValues={editing}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </div>
    </>
  )
}