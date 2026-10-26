const API_URL = 'http://localhost:8080/pets'; // Ajusta el puerto según tu backend

export const getAvailablePets = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Error al consultar las mascotas');
  }
  const pets = await response.json();

  // Criterio HU01: Solo 'Disponible' y con salud diferente a 'Enfermo' o 'En tratamiento'
  return pets.filter(
    (pet) =>
      pet.adoptionStatus === 'Disponible' &&
      pet.healthStatus !== 'Enfermo' &&
      pet.healthStatus !== 'En tratamiento'
  );
};