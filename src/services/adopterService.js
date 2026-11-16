import { api } from './apiClient'

// El back expone el adoptante como { id, address, phone, occupation }
// (no tiene nombre: el nombre sale del usuario actual).
const toAdopter = (dto) => ({
  id: dto.id,
  address: dto.address ?? '',
  phone: dto.phone ?? '',
  occupation: dto.occupation ?? '',
})

export const getAdopter = async (id) => toAdopter(await api.get(`/adopters/${id}`))

// Las reglas (dirección y teléfono obligatorios, dirección bloqueada con una
// solicitud pendiente) las valida el back y su mensaje llega a la pantalla.
export const updateAdopter = async (id, { address, phone, occupation }) =>
  toAdopter(await api.put(`/adopters/${id}`, { address, phone, occupation }))

// El back rechaza la eliminación si el adoptante tiene adopciones,
// solicitudes de adopción o reseñas registradas.
export const deleteAdopter = (id) => api.delete(`/adopters/${id}`)

// El back no tiene un endpoint de resumen: se cuentan los registros del
// adoptante a partir de los listados (solicitudes y adopciones se filtran aquí;
// las reseñas sí tienen endpoint por adoptante).
export async function getAdopterSummary(id) {
  const [requests, adoptions, reviews] = await Promise.all([
    api.get('/adoption-requests'),
    api.get('/adoptions'),
    api.get(`/adopters/${id}/reviews`),
  ])
  return {
    requestsCount: requests.filter((request) => request.adopter?.id === id).length,
    adoptionsCount: adoptions.filter((adoption) => adoption.adopter?.id === id).length,
    reviewsCount: reviews.length,
  }
}
