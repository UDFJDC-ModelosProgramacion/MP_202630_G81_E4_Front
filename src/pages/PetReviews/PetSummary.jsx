import Card from '../../components/Card/Card'
import styles from './PetSummary.module.css'

export default function PetSummary({ pet }) {
  return (
    <Card>
      <div className={styles.summary}>
        <div className={styles.photo} aria-hidden="true">
          Foto
        </div>
        <div>
          <p className={styles.name}>{pet.name}</p>
          <p className={styles.details}>
            {pet.breed} · {pet.age} · {pet.sex} · {pet.size}
          </p>
          <p className={styles.status}>Estado: {pet.status}</p>
        </div>
      </div>
    </Card>
  )
}