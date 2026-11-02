const API_URL = 'http://localhost:8080'; // Ajusta al puerto de tu backend

export const getMedicalHistory = async (petId) => {
  const response = await fetch(`${API_URL}/pets/${petId}/medical-history`);
  
  // Criterio: Si la mascota indicada no existe, se informa que no fue encontrada
  if (response.status === 404) {
    throw new Error('La mascota indicada no fue encontrada.');
  }

  if (!response.ok) {
    throw new Error('Error de conexión al consultar el historial médico.');
  }

  return await response.json();
};