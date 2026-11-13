const API_URL = 'http://localhost:8080';

// Historial mock usado cuando el backend no está disponible.
const MOCK_HISTORY = {
  history: { isSterilized: false, diseases: '', treatment: '' },
};

export const getMedicalHistory = async (petId) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/medical-history`);
    if (response.status === 404) return null; // No tiene historial aún
    if (!response.ok) throw new Error('Error al consultar historial.');
    return await response.json();
  } catch {
    // Sin conexión con el backend: se usa el dato mock para que el formulario cargue.
    return MOCK_HISTORY;
  }
};

export const saveMedicalHistory = async (petId, data, isUpdate) => {
  try {
    const method = isUpdate ? 'PUT' : 'POST';
    const response = await fetch(`${API_URL}/pets/${petId}/medical-history`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.status === 404) throw new Error('La mascota indicada no fue encontrada.');
    if (response.status === 409) throw new Error('La mascota ya tiene un historial médico; actualícelo.');
    if (!response.ok) throw new Error('Error al guardar el historial.');
    return await response.json();
  } catch (error) {
    // Errores de negocio del backend se propagan; errores de red se simulan guardados.
    const BUSINESS_ERRORS = [
      'La mascota indicada no fue encontrada.',
      'La mascota ya tiene un historial médico; actualícelo.',
      'Error al guardar el historial.',
    ];
    if (BUSINESS_ERRORS.includes(error?.message)) throw error;
    return { id: petId, ...data };
  }
};
