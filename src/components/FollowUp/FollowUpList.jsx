import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../Button/Button'
import Card from '../Card/Card'
import ScreenState from '../ScreenState/ScreenState'
import { getFollowUps } from '../../services/followUpService'
import styles from './FollowUpList.module.css'

export default function FollowUpList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterPet, setFilterPet] = useState('')
  const [filterAdoption, setFilterAdoption] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await getFollowUps({ petName: filterPet, adoptionId: filterAdoption })
        if (!cancelled) setItems(list)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    return () => {
      cancelled = true
    }
  }, [filterPet, filterAdoption])

  if (loading) return <ScreenState state="loading" message="Cargando seguimientos..." />

  if (error) {
    return (
      <div className={styles.page}>
        <ScreenState state="error" message={error} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>HU08 · Consultar seguimientos veterinarios</h1>
        <p className={styles.subtitle}>
          Consulta la lista de seguimientos veterinarios registrados sobre adopciones
          activas. Filtra por mascota o por adopción.
        </p>
      </div>

      <Card title="Filtros de búsqueda">
        <div className={styles.filters}>
          <div className={styles.field}>
            <label htmlFor="filterPet">Buscar por mascota</label>
            <input
              id="filterPet"
              type="text"
              placeholder="Ej: Toby, Nube..."
              value={filterPet}
              onChange={(e) => setFilterPet(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="filterAdoption">Filtrar por adopción</label>
            <input
              id="filterAdoption"
              type="text"
              placeholder="Ej: AD-101"
              value={filterAdoption}
              onChange={(e) => setFilterAdoption(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFilterPet('')
              setFilterAdoption('')
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card title="Resultados">
          <p className={styles.empty}>
            No se encontraron seguimientos veterinarios con los filtros seleccionados.
          </p>
        </Card>
      ) : (
        <Card title={`Seguimientos encontrados (${items.length})`}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Mascota</th>
                  <th>Adopción</th>
                  <th>Veterinario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((fu) => (
                  <tr key={fu.id}>
                    <td>{fu.id}</td>
                    <td>{fu.date}</td>
                    <td>{fu.petName}</td>
                    <td>
                      {fu.adoptionId}
                      <br />
                      <span className={styles.muted}>{fu.adopterName}</span>
                    </td>
                    <td>{fu.vetName}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[`status_${fu.status}`] || ''}`}>
                        {fu.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/follow-ups/${fu.id}`} className={styles.link}>
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className={styles.actions}>
        <Button type="button" onClick={() => navigate('/follow-ups/new')}>
          Registrar nuevo seguimiento
        </Button>
      </div>
    </div>
  )
}
