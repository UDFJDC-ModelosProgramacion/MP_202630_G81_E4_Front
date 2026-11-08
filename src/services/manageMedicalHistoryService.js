const API_URL = 'http://localhost:8080';

export const getMedicalHistory = async (petId) => {
  const response = await fetch(`${API_URL}/pets/${petId}/medical-history`);
  if (response.status === 404) return null; // No tiene historial aún
  if (!response.ok) throw new Error('Error al consultar historial.');
  return await response.json();
};

export const saveMedicalHistory = async (petId, data, isUpdate) => {
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
};