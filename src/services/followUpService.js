import { api } from './apiClient'

// ---------------------------------------------------------------------------
// HU08 (consultar seguimientos): conectado al back real (GET /api/follow-ups).
// Los errores NO se capturan: suben tal cual para que la pantalla muestre el
// mensaje del back (404 -> "FollowUp not found", sin conexión, etc.).
// ---------------------------------------------------------------------------

// El back devuelve FollowUpDetailDTO:
//   { id, followId, date, petCondition, notes,
//     veterinarian:{id, veterinarianId, specialty}, adoption:{id, adoptionId, adopter:{id}}, pet:{id, name} }
// Las pantallas usan otra forma (petName, vetName, adopterName...), así que
// se traduce aquí y los componentes no cambian.
export function toFollowUpView(dto) {
  const vet = dto.veterinarian
  const adoption = dto.adoption
  const pet = dto.pet
  return {
    id: dto.id,
    followId: dto.followId,
    date: dto.date ? String(dto.date).slice(0, 10) : '',
    notes: dto.notes ?? '',
    // El back no tiene "estado" del seguimiento; el equivalente es petCondition.
    status: dto.petCondition ?? '',
    
    petId: pet?.id ?? '',
    petName: pet?.name ?? 'Desconocido',
    vetId: vet?.id ?? '',
    vetName: vet ? [vet.veterinarianId, vet.specialty].filter(Boolean).join(' · ') : 'Desconocido',
    adoptionRefId: adoption?.id ?? '',
    adoptionId: adoption?.adoptionId ?? '',
    adopterName: adoption?.adopter?.id ? `Adoptante #${adoption.adopter.id}` : 'Desconocido',
  }
}

export async function getFollowUpById(id) {
  const dto = await api.get(`/follow-ups/${id}`)
  return toFollowUpView(dto)
}

// El back todavía no filtra (GET /follow-ups devuelve todo), se filtra aquí.
export async function getFollowUps(filters = {}) {
  const list = (await api.get('/follow-ups')).map(toFollowUpView)
  const pet = filters.petName?.trim().toLowerCase()
  const adoption = filters.adoptionId?.trim().toLowerCase()
  return list.filter(
    (f) =>
      (!pet || f.petName.toLowerCase().includes(pet)) &&
      (!adoption || String(f.adoptionId).toLowerCase().includes(adoption)),
  )
}

// ---------------------------------------------------------------------------
// HU07 (registrar / actualizar seguimiento): conectado al back real.
// ---------------------------------------------------------------------------

// El back espera FollowUpDTO con asociaciones por id y la fecha como instante.
// Zona horaria de Colombia (UTC-5), igual que las colecciones de Postman.
export function toFollowUpPayload(form) {
  return {
    followId: form.followId || `F-${Date.now()}`,
    date: `${form.date}T00:00:00-05:00`,
    petCondition: form.status,
    notes: form.notes?.trim() ? form.notes : null,
    veterinarian: { id: Number(form.vetId) },
    adoption: { id: Number(form.adoptionId) },
    pet: { id: Number(form.petId) },
  }
}

export async function createFollowUp(form) {
  return toFollowUpView(await api.post('/follow-ups', toFollowUpPayload(form)))
}

export async function updateFollowUp(id, form) {
  return toFollowUpView(await api.put(`/follow-ups/${id}`, toFollowUpPayload(form)))
}

// Catálogos para los selects del formulario.
// El back no filtra por estado: se piden todas y se dejan las ACTIVA.
export async function getActiveAdoptions() {
  const list = await api.get('/adoptions')
  return list
    .filter((a) => a.status === 'ACTIVA')
    .map((a) => ({
      id: a.id,
      adoptionId: a.adoptionId,
      adopter: a.adopter?.id ? `Adoptante #${a.adopter.id}` : 'Sin adoptante',
      status: a.status,
    }))
}

export async function getPets() {
  const list = await api.get('/pets')
  return list.map((p) => ({ id: p.id, name: p.name, species: p.specie }))
}

// No existe GET /veterinarians: los veterinarios se piden por refugio.
export async function getVets() {
  const shelters = await api.get('/shelters')
  const perShelter = await Promise.all(
    shelters.map((sh) => api.get(`/shelters/${sh.id}/veterinarians`)),
  )
  return perShelter.flat().map((v) => ({
    id: v.id,
    name: [v.veterinarianId, v.specialty].filter(Boolean).join(' · '),
  }))
}
