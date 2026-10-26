// MOCK service for HU02: data lives in memory. When the Front connects to the
// Back, replace each body with a fetch('/api/adoption-requests...') call and
// keep the same function names. Note: the Back currently answers some errors
// in English; the texts here are the Spanish ones the screen should show.
export const REQUEST_STATUS = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADO',
  CANCELLED: 'CANCELADO',
}

const PETS = [
  { id: 1, name: 'Luna', breed: 'Labrador', age: 2, shelter: 'Refugio Esperanza', adoptionStatus: 'DISPONIBLE' },
  { id: 2, name: 'Max', breed: 'Beagle', age: 4, shelter: 'Huellas Felices', adoptionStatus: 'ADOPTADA' },
  { id: 3, name: 'Nala', breed: 'Criollo', age: 1, shelter: 'Patitas', adoptionStatus: 'DISPONIBLE' },
  { id: 4, name: 'Toby', breed: 'Poodle', age: 3, shelter: 'Vida Animal', adoptionStatus: 'DISPONIBLE' },
]

const INITIAL_REQUESTS = [
  {
    id: 1,
    adopterId: 12,
    petId: 1,
    dateRequest: '2026-10-21',
    status: REQUEST_STATUS.PENDING,
    description: 'Tengo un patio cercado y experiencia con perros grandes.',
  },
  {
    id: 2,
    adopterId: 12,
    petId: 2,
    dateRequest: '2026-09-30',
    status: REQUEST_STATUS.APPROVED,
    description: 'Quiero darle un hogar a Max.',
  },
  {
    id: 3,
    adopterId: 12,
    petId: 3,
    dateRequest: '2026-09-12',
    status: REQUEST_STATUS.CANCELLED,
    description: 'Solicitud cancelada por el adoptante.',
  },
]

const KNOWN_ADOPTER_IDS = [12, 13, 14]

let requests = INITIAL_REQUESTS.map((request) => ({ ...request }))
let nextId = 4

// Only for tests: puts the in-memory data back to its initial state.
export function resetAdoptionRequests() {
  requests = INITIAL_REQUESTS.map((request) => ({ ...request }))
  nextId = 4
}

function withPet(request) {
  return { ...request, pet: { ...PETS.find((pet) => pet.id === request.petId) } }
}

export async function listPets() {
  return PETS.map((pet) => ({ ...pet }))
}

export async function listAdoptionRequests(adopterId) {
  return requests
    .filter((request) => request.adopterId === adopterId)
    .sort((a, b) => b.dateRequest.localeCompare(a.dateRequest))
    .map(withPet)
}

export async function createAdoptionRequest({ adopterId, petId, dateRequest, description }) {
  if (!KNOWN_ADOPTER_IDS.includes(adopterId)) {
    throw new Error('No se pudo registrar la solicitud: el adoptante no es válido.')
  }
  const pet = PETS.find((item) => item.id === petId)
  if (!pet) {
    throw new Error('No se pudo registrar la solicitud: debes seleccionar una mascota válida.')
  }
  if (pet.adoptionStatus === 'ADOPTADA') {
    throw new Error('No se pudo registrar la solicitud porque la mascota ya fue adoptada.')
  }
  if (!dateRequest) {
    throw new Error('No se pudo registrar la solicitud: la fecha de solicitud es obligatoria.')
  }
  const hasPending = requests.some(
    (request) =>
      request.adopterId === adopterId &&
      request.petId === petId &&
      request.status === REQUEST_STATUS.PENDING,
  )
  if (hasPending) {
    throw new Error(
      'No se pudo registrar la solicitud porque ya tienes una solicitud pendiente para esta mascota.',
    )
  }

  const request = {
    id: nextId,
    adopterId,
    petId,
    dateRequest,
    status: REQUEST_STATUS.PENDING,
    description,
  }
  nextId += 1
  requests.push(request)
  return withPet(request)
}
