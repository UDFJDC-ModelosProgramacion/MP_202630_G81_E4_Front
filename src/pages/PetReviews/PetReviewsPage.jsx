import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ScreenState from '../../components/ScreenState/ScreenState'
import { createReview, getPet, getReviews } from '../../services/reviewService'
import PetSummary from './PetSummary'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import styles from './PetReviewsPage.module.css'

export default function PetReviewsPage() {
  const { petId } = useParams()
  const [pet, setPet] = useState(null)
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    Promise.all([getPet(petId), getReviews(petId)])
      .then(([petData, reviewsData]) => {
        if (cancelled) return
        setPet(petData)
        setReviews(reviewsData)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [petId])

  async function handleSubmit({ rating, comment }) {
    const review = await createReview(petId, { rating, comment })
    setReviews((current) => [review, ...current])
  }

  if (status === 'loading') {
    return <ScreenState state="loading" />
  }
  if (status === 'error') {
    return <ScreenState state="error" message="No se pudo cargar la mascota." />
  }

  return (
    <>
      <h1>HU15 · Reseña de una mascota</h1>
      <PetSummary pet={pet} />
      <div className={styles.columns}>
        <ReviewForm petName={pet.name} onSubmit={handleSubmit} />
        <ReviewList petName={pet.name} reviews={reviews} />
      </div>
    </>
  )
}