import { beforeEach, describe, it, expect } from 'vitest'
import {
  createAdoptionRequest,
  listAdoptionRequests,
  listPets,
  resetAdoptionRequests,
} from './adoptionRequestService'

const validRequest = {
  adopterId: 12,
  petId: 4,
  dateRequest: '2026-10-25',
  description: 'Tengo un patio cercado.',
}

describe('adoptionRequestService', () => {
  beforeEach(() => resetAdoptionRequests())

  it('lists the pets', async () => {
    expect(await listPets()).toHaveLength(4)
  })

  it('lists the requests of an adopter, newest first, with their pet', async () => {
    const requests = await listAdoptionRequests(12)
    expect(requests.map((request) => request.pet.name)).toEqual(['Luna', 'Max', 'Nala'])
  })

  it('lists nothing for an adopter without requests', async () => {
    expect(await listAdoptionRequests(13)).toEqual([])
  })

  it('registers a pending request and shows it afterwards', async () => {
    const created = await createAdoptionRequest(validRequest)
    expect(created.status).toBe('PENDIENTE')
    expect(created.pet.name).toBe('Toby')
    expect(await listAdoptionRequests(12)).toHaveLength(4)
  })

  it('rejects an adopter that is not valid', async () => {
    await expect(createAdoptionRequest({ ...validRequest, adopterId: 99 })).rejects.toThrow(
      'el adoptante no es válido',
    )
  })

  it('rejects a missing pet', async () => {
    await expect(createAdoptionRequest({ ...validRequest, petId: null })).rejects.toThrow(
      'debes seleccionar una mascota válida',
    )
  })

  it('rejects a pet that does not exist', async () => {
    await expect(createAdoptionRequest({ ...validRequest, petId: 99 })).rejects.toThrow(
      'debes seleccionar una mascota válida',
    )
  })

  it('rejects a pet that was already adopted', async () => {
    await expect(createAdoptionRequest({ ...validRequest, petId: 2 })).rejects.toThrow(
      'la mascota ya fue adoptada',
    )
  })

  it('rejects a request without date', async () => {
    await expect(createAdoptionRequest({ ...validRequest, dateRequest: '' })).rejects.toThrow(
      'la fecha de solicitud es obligatoria',
    )
  })

  it('rejects a second pending request for the same pet', async () => {
    await expect(createAdoptionRequest({ ...validRequest, petId: 1 })).rejects.toThrow(
      'ya tienes una solicitud pendiente para esta mascota',
    )
  })

  it('allows a new request when the previous one for that pet was cancelled', async () => {
    const created = await createAdoptionRequest({ ...validRequest, petId: 3 })
    expect(created.pet.name).toBe('Nala')
  })
})
