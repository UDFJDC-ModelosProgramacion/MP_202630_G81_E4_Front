import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import { createAdoptionRequest, listAdoptionRequests, listPets } from './adoptionRequestService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

const lunaDto = {
  id: 10,
  name: 'Luna',
  specie: 'Perro',
  breed: 'Labrador',
  age: 2,
  adoptionStatus: 'Disponible',
  shelter: { id: 1, city: 'Bogotá' },
}

const requestDto = (overrides = {}) => ({
  id: 1,
  requestId: 'REQ-1',
  dateRequest: '2026-10-21T00:00:00.000+00:00',
  status: 'PENDIENTE',
  description: 'Tengo un patio cercado.',
  adopter: { id: 1 },
  pet: { id: 10, name: 'Luna' },
  ...overrides,
})

const validRequest = {
  adopterId: 1,
  petId: 10,
  dateRequest: '2026-10-21',
  description: 'Tengo un patio cercado.',
}

beforeEach(() => vi.clearAllMocks())

describe('adoptionRequestService', () => {
  describe('listPets', () => {
    it('lists the pets in the shape of the screen', async () => {
      api.get.mockResolvedValue([lunaDto])

      const pets = await listPets()

      expect(api.get).toHaveBeenCalledWith('/pets')
      expect(pets).toEqual([
        {
          id: 10,
          name: 'Luna',
          breed: 'Labrador',
          age: 2,
          shelter: 'Bogotá',
          adoptionStatus: 'DISPONIBLE',
        },
      ])
    })

    it('tolerates a pet without shelter or adoption status', async () => {
      api.get.mockResolvedValue([{ ...lunaDto, shelter: null, adoptionStatus: null }])

      const [pet] = await listPets()

      expect(pet.shelter).toBe('Sin refugio')
      expect(pet.adoptionStatus).toBe('')
    })

    it('lets the error of the back go up when listing fails', async () => {
      api.get.mockRejectedValue(new Error('No hay conexión con el servidor.'))

      await expect(listPets()).rejects.toThrow('No hay conexión con el servidor.')
    })
  })

  describe('listAdoptionRequests', () => {
    it('lists only the requests of the adopter, newest first, keeping only the day', async () => {
      api.get.mockResolvedValue([
        requestDto({ id: 1, dateRequest: '2026-09-12T00:00:00.000+00:00', pet: { id: 3, name: 'Nala' } }),
        requestDto({ id: 2, dateRequest: '2026-10-21T00:00:00.000+00:00' }),
        requestDto({ id: 3, adopter: { id: 2 } }),
        requestDto({ id: 4, dateRequest: '2026-09-30T00:00:00.000+00:00', pet: { id: 2, name: 'Max' } }),
      ])

      const requests = await listAdoptionRequests(1)

      expect(api.get).toHaveBeenCalledWith('/adoption-requests')
      expect(requests.map((request) => [request.pet.name, request.dateRequest])).toEqual([
        ['Luna', '2026-10-21'],
        ['Max', '2026-09-30'],
        ['Nala', '2026-09-12'],
      ])
    })

    it('orders by id when two requests have the same date', async () => {
      api.get.mockResolvedValue([requestDto({ id: 1 }), requestDto({ id: 2 })])

      const requests = await listAdoptionRequests(1)

      expect(requests.map((request) => request.id)).toEqual([2, 1])
    })

    it('translates the DTO and tolerates missing associations', async () => {
      api.get.mockResolvedValue([
        requestDto({ id: 5, pet: null, adopter: { id: 1 }, dateRequest: null, description: null }),
      ])

      const [request] = await listAdoptionRequests(1)

      expect(request).toEqual({
        id: 5,
        adopterId: 1,
        petId: null,
        dateRequest: '',
        status: 'PENDIENTE',
        description: '',
        pet: { id: null, name: 'Mascota' },
      })
    })

    it('returns an empty list for an adopter without requests', async () => {
      api.get.mockResolvedValue([requestDto({ adopter: { id: 2 } })])

      expect(await listAdoptionRequests(1)).toEqual([])
    })
  })

  describe('createAdoptionRequest', () => {
    it('sends a pending request with the date as the back expects it', async () => {
      api.post.mockResolvedValue(requestDto({ id: 9 }))

      const created = await createAdoptionRequest(validRequest)

      const [path, body] = api.post.mock.calls[0]
      expect(path).toBe('/adoption-requests')
      expect(body).toEqual({
        requestId: expect.stringMatching(/^REQ-\d+$/),
        dateRequest: '2026-10-21T00:00:00.000Z',
        status: 'PENDIENTE',
        description: 'Tengo un patio cercado.',
        adopter: { id: 1 },
        pet: { id: 10 },
      })
      expect(created).toMatchObject({ id: 9, status: 'PENDIENTE', pet: { name: 'Luna' } })
    })

    it('does not send the associations or the date that are missing so the back explains it', async () => {
      api.post.mockRejectedValue(new Error('Pet is not valid'))

      await expect(
        createAdoptionRequest({ adopterId: null, petId: null, dateRequest: '', description: '' }),
      ).rejects.toThrow('debes seleccionar una mascota válida')

      const body = api.post.mock.calls[0][1]
      expect(body.adopter).toBeUndefined()
      expect(body.pet).toBeUndefined()
      expect(body.dateRequest).toBeUndefined()
    })

    it.each([
      ['Adopter is not valid', 'el adoptante no es válido'],
      ['Pet is not valid', 'debes seleccionar una mascota válida'],
      [
        'Unable to create AdoptionRequest, the pet is already adopted',
        'la mascota ya fue adoptada',
      ],
      ['Date request is not valid', 'la fecha de solicitud es obligatoria'],
      [
        'The adopter already has a pending AdoptionRequest for this pet',
        'ya tienes una solicitud pendiente para esta mascota',
      ],
    ])('translates the error "%s" of the back to Spanish', async (backMessage, spanishPart) => {
      api.post.mockRejectedValue(new Error(backMessage))

      await expect(createAdoptionRequest(validRequest)).rejects.toThrow(spanishPart)
    })

    it('lets any other error of the back go up unchanged', async () => {
      api.post.mockRejectedValue(new Error('No hay conexión con el servidor.'))

      await expect(createAdoptionRequest(validRequest)).rejects.toThrow(
        'No hay conexión con el servidor.',
      )
    })
  })
})
