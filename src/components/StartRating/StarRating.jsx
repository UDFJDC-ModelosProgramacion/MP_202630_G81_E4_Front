import styles from './StarRating.module.css'

const STARS = [1, 2, 3, 4, 5]

export default function StarRating({ value, onChange, readOnly = false }) {
  if (readOnly) {
    return (
      <span className={styles.stars} role="img" aria-label={`${value} de 5`}>
        {STARS.map((star) => (
          <span key={star} className={star <= value ? styles.filled : styles.empty}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className={styles.stars} role="group" aria-label="Calificación">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.filled : styles.empty}`}
          aria-label={`${star} de 5`}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </span>
  )
}