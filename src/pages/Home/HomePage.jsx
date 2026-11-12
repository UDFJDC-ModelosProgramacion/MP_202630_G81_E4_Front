import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import StarRating from '../../components/StarRating/StarRating'
import { getShelters } from '../../services/shelterService'
import { getReviews } from '../../services/reviewService'
import styles from './HomePage.module.css'

// Accesos rápidos a los módulos principales de la aplicación.
const QUICK_ACTIONS = [
  {
    to: '/pets',
    icon: '🐶',
    title: 'Mascotas disponibles',
    description:
      'Explora las mascotas con estado disponible y salud apta para iniciar una adopción.',
  },
  {
    to: '/adoptions/new',
    icon: '📝',
    title: 'Solicitar adopción',
    description:
      'Envía la solicitud de adopción para la mascota que deseas adoptar.',
  },
  {
    to: '/shelters',
    icon: '🏠',
    title: 'Refugios',
    description:
      'Consulta y gestiona los refugios registrados, su dirección y capacidad.',
  },
  {
    to: '/adoption-requests',
    icon: '📋',
    title: 'Solicitudes de adopción',
    description:
      'Revisa el estado de las solicitudes enviadas por los adoptantes.',
  },
  {
    to: '/trial-requests/new',
    icon: '🧪',
    title: 'Periodos de prueba',
    description:
      'Solicita un periodo de prueba antes de formalizar la adopción.',
  },
  {
    to: '/follow-ups',
    icon: '🩺',
    title: 'Seguimientos veterinarios',
    description:
      'Consulta los controles y seguimientos de salud de las mascotas.',
  },
]

// Mascota de ejemplo que ya cuenta con reseñas (HU15).
const FEATURED_PET_ID = 1

export default function HomePage() {
  const [shelters, setShelters] = useState([])
  const [reviews, setReviews] = useState([])
  const [loadingShelters, setLoadingShelters] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [sheltersError, setSheltersError] = useState('')
  const [reviewsError, setReviewsError] = useState('')

  useEffect(() => {
    let cancelled = false

    getShelters()
      .then((data) => {
        if (!cancelled) setShelters(data)
      })
      .catch((error) => {
        if (!cancelled) setSheltersError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingShelters(false)
      })

    getReviews(FEATURED_PET_ID)
      .then((data) => {
        if (!cancelled) setReviews(data)
      })
      .catch((error) => {
        if (!cancelled) setReviewsError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingReviews(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const featuredShelters = shelters.slice(0, 3)
  const featuredReviews = reviews.slice(0, 3)

  return (
    <div className={styles.page}>
      {/* Portada principal */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>ADOPCIÓN DE MASCOTAS</p>
          <h1>Encuentra a tu próximo compañero de vida</h1>
          <p className={styles.heroSubtitle}>
            Conectamos refugios, adoptantes y mascotas para que cada animal
            encuentre un hogar responsable. Explora las mascotas disponibles,
            conoce los refugios y sigue el proceso de adopción paso a paso.
          </p>
          <div className={styles.heroActions}>
            <Link to="/pets" className={`${styles.cta} ${styles.ctaPrimary}`}>
              Ver mascotas disponibles
            </Link>
            <Link
              to="/adoptions/new"
              className={`${styles.cta} ${styles.ctaSecondary}`}
            >
              Solicitar adopción
            </Link>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <span className={styles.heroEmoji}>🐶</span>
          <span className={styles.heroEmoji}>🐱</span>
        </div>
      </section>

      {/* Accesos rápidos a los módulos */}
      <section className={styles.section}>
        <h2>¿Qué deseas hacer hoy?</h2>
        <div className={styles.actionsGrid}>
          {QUICK_ACTIONS.map(({ to, icon, title, description }) => (
            <Link key={to} to={to} className={styles.actionCard}>
              <span className={styles.actionIcon} aria-hidden="true">
                {icon}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Refugios destacados (HU13) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Refugios destacados</h2>
          <Link to="/shelters" className={styles.sectionLink}>
            Ver todos los refugios
          </Link>
        </div>

        {loadingShelters ? (
          <ScreenState state="loading" />
        ) : sheltersError ? (
          <ScreenState state="error" message={sheltersError} />
        ) : featuredShelters.length === 0 ? (
          <ScreenState state="empty" message="No hay refugios registrados todavía." />
        ) : (
          <div className={styles.sheltersGrid}>
            {featuredShelters.map((shelter) => (
              <Card key={shelter.id}>
                <h3 className={styles.cardTitle}>{shelter.name}</h3>
                <p className={styles.shelterMeta}>
                  📍 {shelter.address || 'Dirección no registrada'}
                </p>
                <p className={styles.shelterMeta}>
                  📞 {shelter.phone || 'Teléfono no registrado'}
                </p>
                <p className={styles.shelterMeta}>
                  Capacidad para {shelter.capacity} mascotas
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Testimonios de adopción (HU15) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Lo que dicen los adoptantes</h2>
          <Link to="/pets/1/reviews" className={styles.sectionLink}>
            Ver reseñas de la mascota
          </Link>
        </div>

        {loadingReviews ? (
          <ScreenState state="loading" />
        ) : reviewsError ? (
          <ScreenState state="error" message={reviewsError} />
        ) : featuredReviews.length === 0 ? (
          <ScreenState state="empty" message="Aún no hay reseñas publicadas." />
        ) : (
          <div className={styles.reviewsGrid}>
            {featuredReviews.map((review) => (
              <Card key={review.id}>
                <StarRating value={review.rating} readOnly />
                <p className={styles.reviewComment}>{review.comment}</p>
                <strong className={styles.reviewAuthor}>
                  {review.adopterName}
                </strong>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Llamado a la acción final */}
      <section className={styles.ctaBand}>
        <h2>¿Listo para darle un hogar?</h2>
        <p>
          Da el primer paso: revisa las mascotas disponibles y envía tu
          solicitud de adopción.
        </p>
        <Link to="/pets" className={`${styles.cta} ${styles.ctaLight}`}>
          Explorar mascotas
        </Link>
      </section>
    </div>
  )
}
