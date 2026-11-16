import { Link, NavLink } from 'react-router-dom'
import { ROLES } from '../../config/currentUser'
import { useCurrentUser } from '../../context/useCurrentUser'
import styles from './Navbar.module.css'

const LINKS = [
  { path: '/pets', label: 'Mascotas', roles: [ROLES.ADOPTER, ROLES.VET] },
  { path: '/adoptions/new', label: 'Solicitar adopción', roles: [ROLES.ADOPTER] },
  { path: '/trial-requests/new', label: 'Solicitar periodo de prueba', roles: [ROLES.ADOPTER] },
  { path: '/notifications', label: 'Notificaciones', roles: [ROLES.ADOPTER] },
  { path: '/messages', label: 'Mensajes', roles: [ROLES.ADOPTER] },
  { path: '/profile', label: 'Mi perfil', roles: [ROLES.ADOPTER] },

  { path: '/adoption-requests', label: 'Solicitudes', roles: [ROLES.SHELTER] },
  { path: '/trial-requests', label: 'Gestionar periodos', roles: [ROLES.SHELTER] },
  { path: '/shelters', label: 'Refugios', roles: [ROLES.SHELTER] },
  { path: '/notifications/new', label: 'Enviar notificación', roles: [ROLES.SHELTER] },

  { path: '/follow-ups', label: 'Seguimientos', roles: [ROLES.VET] },
]

export default function Navbar() {
  const { role, setRole } = useCurrentUser()

  const visibleLinks = LINKS.filter((item) => item.roles.includes(role))

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.logo}>
        Pet Adoption Platform
      </Link>

      <div className={styles.controls}>
        <nav aria-label="Principal">
          <ul className={styles.menu}>
            {visibleLinks.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.roleBox}>
          <label htmlFor="navbar-role-select" className={styles.roleLabel}>
            Rol
          </label>
          <select
            id="navbar-role-select"
            className={styles.roleSelect}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value={ROLES.ADOPTER}>Adoptante</option>
            <option value={ROLES.SHELTER}>Refugio</option>
            <option value={ROLES.VET}>Veterinario</option>
          </select>
        </div>
      </div>
    </header>
  )
}