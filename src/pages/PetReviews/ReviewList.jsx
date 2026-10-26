import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import StarRating from '../../components/StarRating/StarRating'
import styles from './ReviewList.module.css'

export default function ReviewList({ petName, reviews }) {
  return (
    <Card title={`Reseñas de ${petName} (${reviews.length})`}>
      {reviews.length === 0 ? (
        <ScreenState state="empty" message="Aún no hay reseñas para esta mascota." />
      ) : (
        <ul className={styles.list}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.item}>
              <strong>{review.adopterName}</strong>
              <div>
                <StarRating value={review.rating} readOnly />
              </div>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}