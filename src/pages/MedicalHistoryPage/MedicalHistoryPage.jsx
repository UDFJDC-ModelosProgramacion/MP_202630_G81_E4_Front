import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicalHistory } from '../../services/medicalHistoryService';
import styles from './MedicalHistoryPage.module.css';

export const MedicalHistoryPage = () => {
  const { petId } = useParams(); // Obtiene el ID de la URL (ej: /pets/1/medical-history)
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay petId (ej. probando el componente suelto), usamos un ID por defecto para que no falle.
    const idToFetch = petId || 1; 

    getMedicalHistory(idToFetch)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [petId]);

  if (loading) return <div className={styles.container}>Cargando historial médico...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>HU09 - Historial médico</h2>
      <p className={styles.breadcrumbs}>Mascotas / {data?.pet?.name || '...'} / Perfil / Historial Médico</p>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Criterio: Si la mascota no tiene historial médico, se informa que no existe[cite: 12] */}
      {!error && data && !data.history && (
        <div className={styles.messageBox}>
          Esta mascota aún no tiene un historial médico registrado.
        </div>
      )}

      {!error && data && (
        <div className={styles.grid}>
          {/* Columna Izquierda: Historial Médico[cite: 12] */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Historial médico</h3>
            
            {data.history ? (
              <>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Esterilizado</span>
                  <p className={styles.fieldValue}>{data.history.isSterilized ? 'Sí' : 'No'}</p>
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Enfermedades registradas</span>
                  <p className={styles.fieldValue}>{data.history.diseases || 'Ninguna'}</p>
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Tratamiento</span>
                  <p className={styles.fieldValue}>{data.history.treatment || 'N/A'}</p>
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Última actualización</span>
                  <p className={styles.fieldValue}>{data.history.lastUpdate}</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#64748b' }}>Sin información médica disponible.</p>
            )}
          </div>

          {/* Columna Derecha: Resumen de la Mascota[cite: 12] */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Mascota</h3>
            <div className={styles.petIcon}>
              {data.pet.species?.toLowerCase() === 'gato' ? '🐱' : '🐶'}
            </div>
            <h4 className={styles.petName}>{data.pet.name}</h4>
            <p className={styles.petDetails}>
              {data.pet.age} años · {data.pet.weight} kg · Refugio: {data.pet.shelter}
            </p>
            <button
              type="button"
              className={styles.buttonOutline}
              onClick={() => navigate(`/pets/${petId || 1}/reviews`)}
            >
              Ver en plataforma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;
