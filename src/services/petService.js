const API_URL = 'http://localhost:8080/pets'; // Ajusta el puerto según tu backend

// Datos mock usados cuando el backend no está disponible, para que la
// pantalla de mascotas sea completamente funcional en desarrollo.
const MOCK_PETS = [
  {
    id: 1,
    name: 'Luna',
    species: 'Perro',
    breed: 'Labrador',
    age: 2,
    shelter: 'Huellas Felices',
    adoptionStatus: 'Disponible',
    healthStatus: 'Sano',
  },
  {
    id: 2,
    name: 'Nala',
    species: 'Gato',
    breed: 'Criollo',
    age: 1,
    shelter: 'Patitas del Norte',
    adoptionStatus: 'Disponible',
    healthStatus: 'Sano',
  },
  {
    id: 3,
    name: 'Toby',
    species: 'Perro',
    breed: 'Poodle',
    age: 3,
    shelter: 'Refugio Esperanza',
    adoptionStatus: 'Disponible',
    healthStatus: 'Sano',
  },
];

// Criterio HU01: Solo 'Disponible' y con salud diferente a 'Enfermo' o 'En tratamiento'
const filterAvailable = (pets) =>
  pets.filter(
    (pet) =>
      pet.adoptionStatus === 'Disponible' &&
      pet.healthStatus !== 'Enfermo' &&
      pet.healthStatus !== 'En tratamiento',
  );

export const getAvailablePets = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al consultar las mascotas');
    }
    const pets = await response.json();
    return filterAvailable(pets);
  } catch {
    // Sin conexión con el backend: se usan los datos mock locales.
    return filterAvailable(MOCK_PETS);
  }
};
