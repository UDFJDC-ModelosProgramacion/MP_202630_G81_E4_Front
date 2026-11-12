const API_URL = 'http://localhost:8080';

// Datos mock usados cuando el backend no está disponible.
const MOCK_EVENTS = {
  1: {
    pet: { id: 1, name: 'Luna', healthStatus: 'Sano' },
    events: [
      {
        type: 'Reporte médico',
        date: '2026-10-02',
        description: 'Vacuna antirrábica aplicada sin novedades.',
      },
      {
        type: 'Incidente',
        date: '2026-09-15',
        description: 'Revisión general de rutina.',
      },
    ],
  },
};

export const getPetDetailsAndEvents = async (petId) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/events`);
    if (response.status === 404) throw new Error('La mascota indicada no fue encontrada.');
    if (!response.ok) throw new Error('Error al consultar eventos.');
    return await response.json(); // { pet: { status: 'Vivo', ... }, events: [...] }
  } catch (error) {
    if (error?.message === 'La mascota indicada no fue encontrada.') throw error;
    // Sin conexión con el backend: se usan los datos mock locales.
    return (
      MOCK_EVENTS[petId] ?? {
        pet: { id: petId, name: 'Mascota', healthStatus: 'Sano' },
        events: [],
      }
    );
  }
};

export const savePetEvent = async (petId, eventData) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Error al registrar el evento.');
    return await response.json();
  } catch (error) {
    if (error?.message === 'Error al registrar el evento.') throw error;
    // Sin conexión con el backend: se simula el registro para la demo local.
    return { id: Date.now(), petId, ...eventData };
  }
};
