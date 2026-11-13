const API_URL = 'http://localhost:8080'; // Ajusta al puerto de tu backend

// Datos mock usados cuando el backend no está disponible.
const MOCK_HISTORIES = {
  1: {
    pet: {
      id: 1,
      name: 'Luna',
      species: 'Perro',
      age: 2,
      weight: 18,
      shelter: 'Huellas Felices',
    },
    history: {
      isSterilized: true,
      diseases: 'Dermatitis atópica',
      treatment: 'Champú medicado',
      lastUpdate: '10/05/2026',
    },
  },
};

export const getMedicalHistory = async (petId) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/medical-history`);

    // Criterio: Si la mascota indicada no existe, se informa que no fue encontrada
    if (response.status === 404) {
      throw new Error('La mascota indicada no fue encontrada.');
    }

    if (!response.ok) {
      throw new Error('Error de conexión al consultar el historial médico.');
    }

    return await response.json();
  } catch (error) {
    // Los errores de negocio (404) se propagan; los de red caen a datos mock.
    if (error?.message === 'La mascota indicada no fue encontrada.') {
      throw error;
    }
    return (
      MOCK_HISTORIES[petId] ?? {
        pet: {
          id: petId,
          name: 'Mascota',
          species: 'Perro',
          age: 2,
          weight: 10,
          shelter: 'Huellas Felices',
        },
        history: null,
      }
    );
  }
};
