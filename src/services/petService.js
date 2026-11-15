import { api } from './apiClient'

// Normaliza el PetDetailDTO del back a la forma que usa la vista.
// El back expone 'specie' y 'shelter' como objeto (ShelterDTO sin 'name',
// se usa la ciudad como identificador visible del refugio).
const toPet = (dto) => ({
  id: dto.id,
  name: dto.name,
  species: dto.specie,
  breed: dto.breed,
  age: dto.age,
  shelter: dto.shelter?.city ?? 'Sin refugio',
  adoptionStatus: dto.adoptionStatus,
  healthStatus: dto.healthStatus,
})

// Criterio HU01: Solo 'Disponible' y con salud diferente a 'Enfermo' o 'En tratamiento'
const filterAvailable = (pets) =>
  pets.filter(
    (pet) =>
      pet.adoptionStatus === 'Disponible' &&
      pet.healthStatus !== 'Enfermo' &&
      pet.healthStatus !== 'En tratamiento',
  )

export const getAvailablePets = async () => {
  const pets = await api.get('/pets')
  return filterAvailable(pets.map(toPet))
}
