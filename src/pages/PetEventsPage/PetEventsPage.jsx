import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPetDetailsAndEvents, savePetEvent } from '../../services/petEventsService';
import styles from './PetEventsPage.module.css';

export const PetEventsPage = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [events, setEvents] = useState([]);
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPetDetailsAndEvents(petId || 1).then(data => {
      setPet(data.pet);
      setEvents(data.events || []);
    }).catch(err => setError(err.message));
  }, [petId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (pet?.healthStatus === 'Fallecido') {
      return setError("No se pueden asociar eventos a una mascota con estado 'Fallecido'.");
    }
    if (!type || !date || !description) {
      return setError("Falta registrar datos obligatorios (tipo, fecha o descripción).");
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    if ((type === 'Reporte médico' || type === 'Incidente') && selectedDate > today) {
      return setError("La fecha no puede ser futura para reportes médicos o incidentes.");
    }

    try {
      await savePetEvent(petId || 1, { type, date, description });
      setEvents([...events, { type, date, description }]);
      setType(''); 
      setDate(''); 
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>HU11 - Eventos de la mascota</h2>
        <h3 className={styles.sectionTitle}>Historial de eventos</h3>
        
        {events.length > 0 ? (
          <div className={styles.historyList}>
            {events.map((ev, i) => (
              <div key={i} className={styles.historyItem}>
                <span className={styles.historyType}>{ev.type}</span>
                <span className={styles.historyDate}>{ev.date}</span>
                <p className={styles.historyDesc}>{ev.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noEvents}>No hay eventos registrados.</p>
        )}
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.sectionTitle}>Registrar evento</h3>
        
        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo *</label>
            <select className={styles.select} value={type} onChange={e => setType(e.target.value)}>
              <option value="">Seleccione...</option>
              <option value="Reporte médico">Reporte médico</option>
              <option value="Incidente">Incidente</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha *</label>
            <input type="date" className={styles.input} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Descripción *</label>
            <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.btnPrimary}>Registrar</button>
            <button type="button" className={styles.btnSecondary}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetEventsPage;
