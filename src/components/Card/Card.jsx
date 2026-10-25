import styles from './Card.module.css'

export default function Card({ title, children }) {
  return (
    <section className={styles.card}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
}