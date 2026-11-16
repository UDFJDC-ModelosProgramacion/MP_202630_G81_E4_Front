import { api, ApiError } from './apiClient'

// El historial se lee anidado en GET /pets/{id}. Si existe, se devuelve con su
// id (necesario para el PUT); si no, null para que el formulario cargue vacío.
export const getMedicalHistory = async (petId) => {
  try {
    const pet = await api.get(`/pets/${petId}`)
    const h = pet.medicalHistory
    if (!h) return null
    return {
      history: {
        id: h.id,
        isSterilized: h.sterilized,
        vaccine: h.vaccine,
        diseases: h.diseases,
        treatment: h.treatment,
      },
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

// El back usa rutas distintas para crear y actualizar:
//  - crear:     POST /pets/{petId}/medical-histories
//  - actualizar: PUT /medical-histories/{historyId}
// El DTO del back usa 'sterilized' (no 'isSterilized').
export const saveMedicalHistory = async (petId, data, historyId) => {
  const body = {
    sterilized: data.isSterilized,
    diseases: data.diseases,
    treatment: data.treatment,
  }
  // Solo se incluye la vacuna si existe, para no sobrescribirla con null en un PUT
  if (data.vaccine !== undefined && data.vaccine !== null) {
    body.vaccine = data.vaccine
  }
  return historyId
    ? api.put(`/medical-histories/${historyId}`, body)
    : api.post(`/pets/${petId}/medical-histories`, body)
}
