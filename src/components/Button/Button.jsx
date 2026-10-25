import styles from './Button.module.css'

export default function Button({ variant = 'primary', type = 'button', children, ...rest }) {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]}`} {...rest}>
      {children}
    </button>
  )
}