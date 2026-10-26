import { api } from './apiClient'

// ---------------------------------------------------------------------------
// Datos mock (HU13). Se usan mientras el backend no está disponible.
// ---------------------------------------------------------------------------
let mockShelters = [
  {
    id: 1,
    nit: '900123456-1',
    name: 'Huellas Felices',
    address: 'Calle 72 #10-25, Bogotá',
    phone: '3105551234',
    capacity: 40,
    email: 'contacto@huellasfelices.org',
  },
  {
    id: 2,
    nit: '900987654-2',
    name: 'Patitas del Norte',
    address: 'Av. Caracas #150-30, Bogotá',
    phone: '3115555678',
    capacity: 25,
    email: 'info@patitasnorte.org',
  },
  {
    id: 3,
    nit: '900555111-3',
    name: 'Refugio Esperanza',
    address: 'Calle 100 #15-40, Bogotá',
    phone: '3205559012',
    capacity: 60,
    email: 'esperanza@refugio.org',
  },
]

let nextId = 4
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Servicio público. Intenta la API real y cae a mock si no está disponible.
// ---------------------------------------------------------------------------
export async function getShelters() {
  try {
    return await api.get('/shelters')
  } catch (err) {
    await delay()
    return [...mockShelters]
  }
}

export async function getShelterById(id) {
  try {
    return await api.get(`/shelters/${id}`)
  } catch (err) {
    await delay()
    const found = mockShelters.find((s) => s.id === Number(id))
    if (!found) {
      const error = new Error(`Refugio ${id} no fue encontrado`)
      error.status = 404
      throw error
    }
    return { ...found }
  }
}

function validate(payload, existingId = null) {
  if (!payload.nit || !payload.nit.trim()) {
    const error = new Error('El NIT es obligatorio')
    error.status = 400
    throw error
  }
  const duplicate = mockShelters.find(
    (s) => s.nit === payload.nit.trim() && s.id !== existingId,
  )
  if (duplicate) {
    const error = new Error('Ya existe un refugio con ese NIT')
    error.status = 409
    throw error
  }
  if (!payload.name || !payload.name.trim()) {
    const error = new Error('El nombre es obligatorio')
    error.status = 400
    throw error
  }
  if (!payload.capacity || Number(payload.capacity) <= 0) {
    const error = new Error('La capacidad debe ser un número mayor a 0')
    error.status = 400
    throw error
  }
}

export async function createShelter(payload) {
  try {
    return await api.post('/shelters', payload)
  } catch (err) {
    await delay()
    validate(payload)
    const newItem = { id: nextId++, ...payload, capacity: Number(payload.capacity) }
    mockShelters = [...mockShelters, newItem]
    return { ...newItem }
  }
}

export async function updateShelter(id, payload) {
  try {
    return await api.put(`/shelters/${id}`, payload)
  } catch (err) {
    await delay()
    const index = mockShelters.findIndex((s) => s.id === Number(id))
    if (index === -1) {
      const error = new Error(`Refugio ${id} no fue encontrado`)
      error.status = 404
      throw error
    }
    validate(payload, Number(id))
    mockShelters[index] = {
      ...mockShelters[index],
      ...payload,
      id: Number(id),
      capacity: Number(payload.capacity),
    }
    return { ...mockShelters[index] }
  }
}

export async function deleteShelter(id) {
  try {
    return await api.delete(`/shelters/${id}`)
  } catch (err) {
    await delay()
    const found = mockShelters.find((s) => s.id === Number(id))
    if (!found) {
      const error = new Error(`Refugio ${id} no fue encontrado`)
      error.status = 404
      throw error
    }
    // HU13: no eliminar si tiene mascotas o procesos activos asociados.
    // En mock, el refugio con id=1 simula tener mascotas asociadas.
    if (found.id === 1) {
      const error = new Error(
        'No se puede eliminar el refugio: tiene mascotas o procesos activos asociados',
      )
      error.status = 409
      throw error
    }
    mockShelters = mockShelters.filter((s) => s.id !== Number(id))
    return null
  }
}
