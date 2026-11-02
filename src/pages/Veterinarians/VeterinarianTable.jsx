import Button from '../../components/Button/Button'
import ScreenState from '../../components/ScreenState/ScreenState'
import styles from './VeterinarianTable.module.css'

export default function VeterinarianTable({ veterinarians, onEdit, onDelete }) {
  if (veterinarians.length === 0) {
    return (
      <ScreenState state="empty" message="Este refugio aún no tiene veterinarios registrados." />
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Licencia</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {veterinarians.map((veterinarian) => (
            <tr key={veterinarian.id}>
              <td>{veterinarian.name}</td>
              <td>{veterinarian.license}</td>
              <td>{veterinarian.phone}</td>
              <td>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    aria-label={`Editar a ${veterinarian.name}`}
                    onClick={() => onEdit(veterinarian)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    aria-label={`Eliminar a ${veterinarian.name}`}
                    onClick={() => onDelete(veterinarian)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}