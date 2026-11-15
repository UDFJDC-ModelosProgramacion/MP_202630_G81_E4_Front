import { api, ApiError } from './apiClient'

// El back no tiene GET /pets/{id}/events: los eventos vienen anidados en el
// PetDetailDTO (GET /pets/{id}).
export const getPetDetailsAndEvents = async (petId) => {
  try {
    const dto = await api.get(`/pets/${petId}`)
    return {
      pet: {
        id: dto.id,
        name: dto.name,
        healthStatus: dto.healthStatus,
      },
      events: dto.events ?? [],
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new ApiError(404, 'La mascota indicada no fue encontrada.')
    }
    throw error
  }
}

export const savePetEvent = async (petId, eventData) =>
  api.post(`/pets/${petId}/events`, eventData)
