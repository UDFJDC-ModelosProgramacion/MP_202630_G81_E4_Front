import { api } from './apiClient'

// HU13 · Refugios, conectado al back real (/api/shelters).
// Los errores del back (404, 412 "No se puede eliminar el shelter porque...")
// suben sin capturar para que la pantalla muestre el mensaje.
//
// Forma del back (ShelterDTO): { id, nit:number, description, capacity:string,
// city, photo, video }. "nit" y "city" son obligatorios en el back.

export function toShelterPayload(form) {
  return {
    nit: Number(String(form.nit).trim()),
    description: (form.description ?? '').trim(),
    capacity: String(form.capacity).trim(),
    city: (form.city ?? '').trim(),
    // El PUT reemplaza todo el registro: se conserva lo que ya tenía.
    photo: form.photo ?? '',
    video: form.video ?? '',
  }
}

export const getShelters = () => api.get('/shelters')

export const getShelterById = (id) => api.get(`/shelters/${id}`)

export const createShelter = (form) => api.post('/shelters', toShelterPayload(form))

export const updateShelter = (id, form) => api.put(`/shelters/${id}`, toShelterPayload(form))

// El back responde 204 sin cuerpo.
export const deleteShelter = (id) => api.delete(`/shelters/${id}`)
