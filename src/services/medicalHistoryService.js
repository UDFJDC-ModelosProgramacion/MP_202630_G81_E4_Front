import { api, ApiError } from './apiClient'

// El back entrega el historial anidado en el PetDetailDTO (GET /pets/{id}).
// No existe un endpoint propio de lectura por mascota.
const toView = (dto) => ({
  pet: {
    id: dto.id,
    name: dto.name,
    species: dto.specie,
    age: dto.age,
    weight: dto.weight,
    shelter: dto.shelter?.city ?? 'Sin refugio',
  },
  history: dto.medicalHistory
    ? {
        isSterilized: dto.medicalHistory.sterilized,
        vaccine: dto.medicalHistory.vaccine,
        diseases: dto.medicalHistory.diseases,
        treatment: dto.medicalHistory.treatment,
      }
    : null,
})

export const getMedicalHistory = async (petId) => {
  try {
    const dto = await api.get(`/pets/${petId}`)
    return toView(dto)
  } catch (error) {
    // Criterio HU09: si la mascota indicada no existe, se informa que no fue encontrada
    if (error instanceof ApiError && error.status === 404) {
      throw new ApiError(404, 'La mascota indicada no fue encontrada.')
    }
    throw error
  }
}
