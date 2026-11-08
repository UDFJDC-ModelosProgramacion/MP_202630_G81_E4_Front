const API_URL = 'http://localhost:8080';

export const getPetDetailsAndEvents = async (petId) => {
  const response = await fetch(`${API_URL}/pets/${petId}/events`);
  if (response.status === 404) throw new Error('La mascota indicada no fue encontrada.');
  if (!response.ok) throw new Error('Error al consultar eventos.');
  return await response.json(); // { pet: { status: 'Vivo', ... }, events: [...] }
};

export const savePetEvent = async (petId, eventData) => {
  const response = await fetch(`${API_URL}/pets/${petId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Error al registrar el evento.');
  return await response.json();
};