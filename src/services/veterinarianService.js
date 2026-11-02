
const SHELTER_NOT_FOUND = 'Refugio no encontrado'
const VETERINARIAN_NOT_FOUND = 'Veterinario no encontrado'

const shelters = {
  1: {
    id: 1,
    name: 'Huellitas del Norte',
    veterinarians: [
      { id: 1, name: 'Dra. Laura Gómez', license: 'MV-10231', phone: '310 555 0101' },
      { id: 2, name: 'Dr. Carlos Ruiz', license: 'MV-20877', phone: '311 555 0144' },
      { id: 3, name: 'Dra. Ana Torres', license: 'MV-30412', phone: '312 555 0178' },
    ],
  },
}

let nextId = 4

const respond = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 300))

const fail = (message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 300))

export function getShelterSummary(shelterId) {
  const shelter = shelters[shelterId]
  return shelter ? respond({ id: shelter.id, name: shelter.name }) : fail(SHELTER_NOT_FOUND)
}

export function listVeterinarians(shelterId) {
  const shelter = shelters[shelterId]
  return shelter ? respond([...shelter.veterinarians]) : fail(SHELTER_NOT_FOUND)
}

export function createVeterinarian(shelterId, { name, license, phone }) {
  const shelter = shelters[shelterId]
  if (!shelter) {
    return fail(SHELTER_NOT_FOUND)
  }
  const veterinarian = {
    id: nextId++,
    name: name.trim(),
    license: license.trim(),
    phone: phone.trim(),
  }
  shelter.veterinarians = [...shelter.veterinarians, veterinarian]
  return respond(veterinarian)
}

export function updateVeterinarian(shelterId, veterinarianId, { name, license, phone }) {
  const shelter = shelters[shelterId]
  if (!shelter) {
    return fail(SHELTER_NOT_FOUND)
  }
  const current = shelter.veterinarians.find((vet) => vet.id === veterinarianId)
  if (!current) {
    return fail(VETERINARIAN_NOT_FOUND)
  }
  const updated = { ...current, name: name.trim(), license: license.trim(), phone: phone.trim() }
  shelter.veterinarians = shelter.veterinarians.map((vet) =>
    vet.id === veterinarianId ? updated : vet,
  )
  return respond(updated)
}

export function deleteVeterinarian(shelterId, veterinarianId) {
  const shelter = shelters[shelterId]
  if (!shelter) {
    return fail(SHELTER_NOT_FOUND)
  }
  if (!shelter.veterinarians.some((vet) => vet.id === veterinarianId)) {
    return fail(VETERINARIAN_NOT_FOUND)
  }
  shelter.veterinarians = shelter.veterinarians.filter((vet) => vet.id !== veterinarianId)
  return respond()
}