import { useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import StarRating from '../../components/StarRating/StarRating'
import { validateReview } from './validateReview'
import styles from './ReviewForm.module.css'

export default function ReviewForm({ petName, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)

  function reset() {
    setRating(0)
    setComment('')
    setErrors({})
    setSubmitError('')
    setSent(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateReview({ rating, comment })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ rating, comment })
      reset()
      setSent(true)
    } catch {
      setSubmitError('No se pudo enviar la reseña. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="Deja tu reseña">
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <span className={styles.label}>Calificación *</span>
          <div className={styles.ratingRow}>
            <StarRating value={rating} onChange={setRating} />
            <span>{rating > 0 ? `${rating} de 5` : 'Sin calificar'}</span>
          </div>
          {errors.rating && (
            <p className={styles.error} role="alert">
              {errors.rating}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="review-comment">Comentario *</label>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={`Cuéntanos tu experiencia con ${petName}...`}
            aria-invalid={Boolean(errors.comment)}
          />
          {errors.comment && (
            <p className={styles.error} role="alert">
              {errors.comment}
            </p>
          )}
        </div>

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}
        {sent && (
          <p className={styles.success} role="status">
            Reseña enviada. ¡Gracias!
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={submitting}>
            Enviar reseña
          </Button>
          <Button variant="secondary" onClick={reset}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}