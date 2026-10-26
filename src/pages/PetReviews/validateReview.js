export function validateReview({ rating, comment }) {
  const errors = {}
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'La calificación debe ser un número entero entre 1 y 5.'
  }
  if (!comment || comment.trim() === '') {
    errors.comment = 'El comentario es obligatorio.'
  }
  return errors
}