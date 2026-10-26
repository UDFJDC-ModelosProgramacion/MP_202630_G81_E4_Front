// MOCK service for HU12: data lives in memory. When the Front connects to the
// Back, replace each body with a fetch('/api/adopters...') call and keep the
// same function names. The error texts are the ones the Back returns.
import { listAdoptionRequests } from './adoptionRequestService'

const INITIAL_ADOPTERS = [
  {
    id: 12,
    name: 'María Gómez',
    address: 'Carrera 7 # 40-10, Bogotá',
    phone: '310 555 6677',
    occupation: 'Ingeniera',
    adoptionsCount: 1,
    reviewsCount: 2,
  },
  // Adopter without adoptions, requests or reviews: the only one that can be deleted.
  {
    id: 13,
    name: 'Pedro Díaz',
    address: 'Calle 45 # 12-30, Medellín',
    phone: '300 111 2233',
    occupation: 'Diseñador',
    adoptionsCount: 0,
    reviewsCount: 0,
  },
  // Adopter that only has reviews: cannot be deleted because of them.
  {
    id: 14,
    name: 'Laura Pérez',
    address: 'Avenida 30 # 8-15, Cali',
    phone: '320 444 5566',
    occupation: 'Docente',
    adoptionsCount: 0,
    reviewsCount: 1,
  },
]

let adopters = INITIAL_ADOPTERS.map((adopter) => ({ ...adopter }))

// Only for tests: puts the in-memory data back to its initial state.
export function resetAdopters() {
  adopters = INITIAL_ADOPTERS.map((adopter) => ({ ...adopter }))
}

function findAdopter(id) {
  const adopter = adopters.find((item) => item.id === id)
  if (!adopter) {
    throw new Error(`El adoptante con ID ${id} no existe.`)
  }
  return adopter
}

function validateAdopter({ address, phone }) {
  if (!address || address.trim() === '') {
    throw new Error('La dirección del adoptante es obligatoria.')
  }
  if (!phone || phone.trim() === '') {
    throw new Error('El teléfono del adoptante es obligatorio.')
  }
}

export async function getAdopter(id) {
  return { ...findAdopter(id) }
}

export async function updateAdopter(id, { address, phone, occupation }) {
  const adopter = findAdopter(id)
  validateAdopter({ address, phone })
  adopter.address = address
  adopter.phone = phone
  adopter.occupation = occupation
  return { ...adopter }
}

export async function deleteAdopter(id) {
  const adopter = findAdopter(id)
  if (adopter.adoptionsCount > 0) {
    throw new Error('No se puede eliminar un adoptante que tiene adopciones registradas.')
  }
  const requests = await listAdoptionRequests(id)
  if (requests.length > 0) {
    throw new Error('No se puede eliminar un adoptante que tiene solicitudes de adopción registradas.')
  }
  if (adopter.reviewsCount > 0) {
    throw new Error('No se puede eliminar un adoptante que tiene reseñas registradas.')
  }
  adopters = adopters.filter((item) => item.id !== id)
}
