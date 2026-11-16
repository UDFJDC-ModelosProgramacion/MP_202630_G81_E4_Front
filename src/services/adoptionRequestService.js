import { api } from './apiClient'
import { toBackDate } from '../utils/backDate'

export const REQUEST_STATUS = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADO',
  CANCELLED: 'CANCELADO',
}

// GET /pets devuelve PetDetailDTO. El ShelterDTO del back no tiene 'name',
// así que (igual que petService) se usa la ciudad como refugio visible.
const toPet = (dto) => ({
  id: dto.id,
  name: dto.name,
  breed: dto.breed,
  age: dto.age,
  shelter: dto.shelter?.city ?? 'Sin refugio',
  adoptionStatus: dto.adoptionStatus ? dto.adoptionStatus.toUpperCase() : '',
})

// El back devuelve la fecha como instante ('2026-10-21T00:00:00.000+00:00'):
// la pantalla solo usa el día.
const toRequest = (dto) => ({
  id: dto.id,
  adopterId: dto.adopter?.id ?? null,
  petId: dto.pet?.id ?? null,
  dateRequest: dto.dateRequest ? String(dto.dateRequest).slice(0, 10) : '',
  status: dto.status,
  description: dto.description ?? '',
  pet: { id: dto.pet?.id ?? null, name: dto.pet?.name ?? 'Mascota' },
})

// El back responde estos errores en inglés. La pantalla los muestra en español
// con los textos del mockup; cualquier otro mensaje del back se deja igual.
const ERROR_TEXTS = {
  'Adopter is not valid': 'No se pudo registrar la solicitud: el adoptante no es válido.',
  'Pet is not valid': 'No se pudo registrar la solicitud: debes seleccionar una mascota válida.',
  'Unable to create AdoptionRequest, the pet is already adopted':
    'No se pudo registrar la solicitud porque la mascota ya fue adoptada.',
  'Date request is not valid':
    'No se pudo registrar la solicitud: la fecha de solicitud es obligatoria.',
  'The adopter already has a pending AdoptionRequest for this pet':
    'No se pudo registrar la solicitud porque ya tienes una solicitud pendiente para esta mascota.',
}

const translateError = (error) =>
  ERROR_TEXTS[error.message] ? new Error(ERROR_TEXTS[error.message]) : error

export const listPets = async () => {
  const data = await api.get('/pets')
  return data.map(toPet)
}

// El back no filtra por adoptante: se traen todas y se filtran aquí.
export const listAdoptionRequests = async (adopterId) => {
  const data = await api.get('/adoption-requests')
  return data
    .map(toRequest)
    .filter((request) => request.adopterId === adopterId)
    .sort((a, b) => b.dateRequest.localeCompare(a.dateRequest) || b.id - a.id)
}

// El back valida adoptante, mascota, que no esté adoptada, la fecha y que no
// haya otra solicitud pendiente para la misma mascota. 'requestId' es un texto
// que el back no genera, así que se arma aquí.
export const createAdoptionRequest = async ({ adopterId, petId, dateRequest, description }) => {
  const body = {
    requestId: `REQ-${Date.now()}`,
    dateRequest: dateRequest ? toBackDate(dateRequest) : undefined,
    status: REQUEST_STATUS.PENDING,
    description,
    adopter: adopterId ? { id: adopterId } : undefined,
    pet: petId ? { id: petId } : undefined,
  }
  try {
    return toRequest(await api.post('/adoption-requests', body))
  } catch (error) {
    throw translateError(error)
  }
}
