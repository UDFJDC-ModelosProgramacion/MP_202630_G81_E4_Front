import { api } from './apiClient'

// ---------------------------------------------------------------------------
// Datos mock (HU07). Se usan mientras el backend no esté disponible.
// ---------------------------------------------------------------------------
const mockAdoptions = [
  { id: 'AD-101', adopter: 'Carlos Ruiz', petId: 1, status: 'ACTIVA' },
  { id: 'AD-104', adopter: 'Ana Torres', petId: 4, status: 'ACTIVA' },
  { id: 'AD-106', adopter: 'María Pérez', petId: 3, status: 'ACTIVA' },
  { id: 'AD-108', adopter: 'Julián Gómez', petId: 5, status: 'ACTIVA' },
]

const mockPets = [
  { id: 1, name: 'Toby', species: 'Canino', breed: 'Beagle' },
  { id: 3, name: 'Rocky', species: 'Canino', breed: 'Labrador' },
  { id: 4, name: 'Nube', species: 'Felino', breed: 'Angora' },
  { id: 5, name: 'Miel', species: 'Felino', breed: 'Mestizo' },
]

const mockVets = [
  { id: 1, name: 'Dr. Juan Parrado' },
  { id: 2, name: 'Dra. Laura Gómez' },
]

let mockFollowUps = [
  {
    id: 'FU-001',
    adoptionId: 'AD-101',
    petId: 1,
    vetId: 1,
    date: '2026-09-05',
    notes: 'Seguimiento inicial aprobado sin alertas',
    status: 'Realizado',
  },
  {
    id: 'FU-002',
    adoptionId: 'AD-104',
    petId: 4,
    vetId: 1,
    date: '2026-09-10',
    notes: 'Peso adecuado (9.8 kg) y buena convivencia',
    status: 'Realizado',
  },
]

let nextId = 3

function enrich(followUp) {
  const pet = mockPets.find((p) => p.id === followUp.petId)
  const vet = mockVets.find((v) => v.id === followUp.vetId)
  const adoption = mockAdoptions.find((a) => a.id === followUp.adoptionId)
  return {
    ...followUp,
    petName: pet ? pet.name : 'Desconocido',
    vetName: vet ? vet.name : 'Desconocido',
    adopterName: adoption ? adoption.adopter : 'Desconocido',
  }
}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Servicio público. Intenta la API real y cae a mock si no está disponible.
// ---------------------------------------------------------------------------
export async function getFollowUpById(id) {
  try {
    return await api.get(`/follow-ups/${id}`)
  } catch {
    await delay()
    const found = mockFollowUps.find((f) => f.id === id)
    if (!found) {
      const error = new Error(`Seguimiento ${id} no fue encontrado`)
      error.status = 404
      throw error
    }
    return enrich(found)
  }
}

export async function createFollowUp(payload) {
  try {
    return await api.post('/follow-ups', payload)
  } catch {
    await delay()
    if (!mockAdoptions.find((a) => a.id === payload.adoptionId && a.status === 'ACTIVA')) {
      const error = new Error('La adopción indicada no existe o no está activa')
      error.status = 400
      throw error
    }
    if (!mockPets.find((p) => p.id === payload.petId)) {
      const error = new Error('La mascota indicada no fue encontrada')
      error.status = 404
      throw error
    }
    if (!mockVets.find((v) => v.id === payload.vetId)) {
      const error = new Error('El veterinario indicado no fue encontrado')
      error.status = 404
      throw error
    }
    if (!payload.date) {
      const error = new Error('La fecha de seguimiento es obligatoria')
      error.status = 400
      throw error
    }
    const newItem = {
      id: `FU-00${nextId++}`,
      ...payload,
      status: payload.status || 'Programado',
    }
    mockFollowUps = [...mockFollowUps, newItem]
    return enrich(newItem)
  }
}

export async function updateFollowUp(id, payload) {
  try {
    return await api.put(`/follow-ups/${id}`, payload)
  } catch {
    await delay()
    const index = mockFollowUps.findIndex((f) => f.id === id)
    if (index === -1) {
      const error = new Error(`Seguimiento ${id} no fue encontrado`)
      error.status = 404
      throw error
    }
    mockFollowUps[index] = { ...mockFollowUps[index], ...payload, id }
    return enrich(mockFollowUps[index])
  }
}

// Catálogos para los selects del formulario
export async function getActiveAdoptions() {
  try {
    return await api.get('/adoptions?status=ACTIVA')
  } catch {
    await delay(100)
    return mockAdoptions.filter((a) => a.status === 'ACTIVA')
  }
}

export async function getVets() {
  try {
    return await api.get('/vets')
  } catch {
    await delay(100)
    return mockVets
  }
}

export async function getPets() {
  try {
    return await api.get('/pets')
  } catch {
    await delay(100)
    return mockPets
  }
}
