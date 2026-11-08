import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMedicalHistory, saveMedicalHistory } from '../../services/manageMedicalHistoryService';
import styles from './ManageMedicalHistoryPage.module.css';

export const ManageMedicalHistoryPage = () => {
  const { petId } = useParams();
  const [isSterilized, setIsSterilized] = useState('Si');
  const [originalSterilized, setOriginalSterilized] = useState(false);
  const [disease, setDisease] = useState('');
  const [treatment, setTreatment] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getMedicalHistory(petId || 1).then((data) => {
      if (data && data.history) {
        setIsUpdate(true);
        setIsSterilized(data.history.isSterilized ? 'Si' : 'No');
        setOriginalSterilized(data.history.isSterilized);
        setDisease(data.history.diseases || '');
        setTreatment(data.history.treatment || '');
      }
    }).catch(err => setErrors([err.message]));
  }, [petId]);

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = [];

    if (originalSterilized && isSterilized === 'No') {
      newErrors.push('Una mascota esterilizada no puede pasar a no esterilizada.');
    }
    if (disease.trim() !== '' && treatment.trim() === '') {
      newErrors.push('Falta el tratamiento: es obligatorio al agregar una enfermedad nueva.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setSuccess('');
      return;
    }

    try {
      await saveMedicalHistory(petId || 1, {
        isSterilized: isSterilized === 'Si',
        diseases: disease,
        treatment: treatment
      }, isUpdate);
      setSuccess('Historial guardado exitosamente.');
      setErrors([]);
    } catch (error) {
      setErrors([error.message]);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>HU10 - Gestionar historial médico</h2>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Esterilizado *</label>
            <select className={styles.select} value={isSterilized} onChange={(e) => setIsSterilized(e.target.value)}>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Enfermedad</label>
            <input type="text" className={styles.input} value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tratamiento (obligatorio si hay enfermedad nueva)</label>
            <textarea className={styles.textarea} value={treatment} onChange={(e) => setTreatment(e.target.value)} />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.btnPrimary}>Guardar</button>
            <button type="button" className={styles.btnSecondary}>Cancelar</button>
          </div>
        </form>
        {success && <p className={styles.successText}>{success}</p>}
      </div>

      <div className={styles.validationBox}>
        <h3 className={styles.validationTitle}>Avisos de validación</h3>
        {errors.length > 0 ? (
          <ul className={styles.errorList}>
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        ) : (
          <p className={styles.noErrorText}>No hay errores.</p>
        )}
      </div>
    </div>
  );
};

export default ManageMedicalHistoryPage;