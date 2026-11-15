import { api } from './apiClient'

// The back calls the license "veterinarianId" (unique) and requires a specialty.
const toVeterinarian = (dto) => ({
  id: dto.id,
  name: dto.name,
  license: dto.veterinarianId,
  specialty: dto.specialty,
  phone: dto.phone,
})

const toBody = ({ name, license, specialty, phone }) => ({
  name: name.trim(),
  veterinarianId: license.trim(),
  specialty: specialty.trim(),
  phone: phone.trim(),
})

export const getShelterSummary = async (shelterId) => {
  const dto = await api.get(`/shelters/${shelterId}`)
  return { id: dto.id, name: dto.name }
}

export const listVeterinarians = async (shelterId) => {
  const data = await api.get(`/shelters/${shelterId}/veterinarians`)
  return data.map(toVeterinarian)
}

export const createVeterinarian = async (shelterId, data) =>
  toVeterinarian(await api.post(`/shelters/${shelterId}/veterinarians`, toBody(data)))

export const updateVeterinarian = async (_shelterId, veterinarianId, data) =>
  toVeterinarian(await api.put(`/veterinarians/${veterinarianId}`, toBody(data)))

export const deleteVeterinarian = (_shelterId, veterinarianId) =>
  api.delete(`/veterinarians/${veterinarianId}`)