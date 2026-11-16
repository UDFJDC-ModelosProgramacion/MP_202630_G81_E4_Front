import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './apiClient'
import {
  createFollowUp,
  getActiveAdoptions,
  getFollowUpById,
  getFollowUps,
  getPets,
  getVets,
  toFollowUpPayload,
  toFollowUpView,
  updateFollowUp,
} from './followUpService'

vi.mock('./apiClient', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())

const backDto = {
  id: 7,
  followId: 'F-001',
  date: '2026-10-01T05:00:00.000+00:00',
  petCondition: 'Buena',
  notes: null,
  veterinarian: { id: 3, veterinarianId: 'V-01', specialty: 'Medicina general' },
  adoption: { id: 5, adoptionId: 'AD-01', adopter: { id: 9 } },
  pet: { id: 2, name: 'Firulais' },
}

describe('followUpService HU08 (consultar, conectado al back)', () => {
  it('toFollowUpView traduce el DTO del back a la forma de las pantallas', () => {
    expect(toFollowUpView(backDto)).toMatchObject({
      id: 7,
      date: '2026-10-01',
      notes: '',
      status: 'Buena',
      petName: 'Firulais',
      vetName: 'V-01 · Medicina general',
      adoptionId: 'AD-01',
      adopterName: 'Adoptante #9',
    })
  })

  it('toFollowUpView tolera asociaciones ausentes', () => {
    const view = toFollowUpView({ id: 1 })
    expect(view.petName).toBe('Desconocido')
    expect(view.vetName).toBe('Desconocido')
    expect(view.adopterName).toBe('Desconocido')
  })

  it('getFollowUps pide /follow-ups y filtra por mascota y adopción', async () => {
    const otro = { ...backDto, id: 8, adoption: { id: 6, adoptionId: 'AD-02' }, pet: { id: 4, name: 'Nube' } }
    api.get.mockResolvedValue([backDto, otro])
    expect(await getFollowUps()).toHaveLength(2)
    expect(api.get).toHaveBeenCalledWith('/follow-ups')
    expect((await getFollowUps({ petName: 'nub' }))[0].petName).toBe('Nube')
    expect((await getFollowUps({ adoptionId: 'ad-01' }))[0].id).toBe(7)
    expect(await getFollowUps({ petName: 'zzz' })).toEqual([])
  })

  it('getFollowUpById pide /follow-ups/:id y devuelve la vista', async () => {
    api.get.mockResolvedValue(backDto)
    const fu = await getFollowUpById(7)
    expect(api.get).toHaveBeenCalledWith('/follow-ups/7')
    expect(fu.petName).toBe('Firulais')
  })

  it('deja subir el error del back (no cae a mock)', async () => {
    api.get.mockRejectedValue(Object.assign(new Error('FollowUp not found'), { status: 404 }))
    await expect(getFollowUpById(0)).rejects.toThrow('FollowUp not found')
    await expect(getFollowUps()).rejects.toThrow('FollowUp not found')
  })
})

const form = {
  followId: 'F-001',
  adoptionId: '5',
  petId: '2',
  vetId: '3',
  date: '2026-10-01',
  notes: '  ',
  status: 'Buena',
}

describe('followUpService HU07 (registrar/actualizar, conectado al back)', () => {
  it('toFollowUpPayload arma el body igual que Postman', () => {
    expect(toFollowUpPayload(form)).toEqual({
      followId: 'F-001',
      date: '2026-10-01T00:00:00-05:00',
      petCondition: 'Buena',
      notes: null,
      veterinarian: { id: 3 },
      adoption: { id: 5 },
      pet: { id: 2 },
    })
  })

  it('genera un followId si el formulario no trae uno', () => {
    expect(toFollowUpPayload({ ...form, followId: '' }).followId).toMatch(/^F-\d+$/)
  })

  it('createFollowUp hace POST y devuelve la vista', async () => {
    api.post.mockResolvedValue(backDto)
    const created = await createFollowUp(form)
    expect(api.post).toHaveBeenCalledWith('/follow-ups', expect.objectContaining({ followId: 'F-001' }))
    expect(created.petName).toBe('Firulais')
  })

  it('updateFollowUp hace PUT a /follow-ups/:id', async () => {
    api.put.mockResolvedValue(backDto)
    await updateFollowUp(7, { ...form, notes: 'Todo bien' })
    expect(api.put).toHaveBeenCalledWith('/follow-ups/7', expect.objectContaining({ notes: 'Todo bien' }))
  })

  it('deja subir el 412 del back al crear', async () => {
    api.post.mockRejectedValue(new Error('Unable to create FollowUp, the Adoption is not confirmed/active'))
    await expect(createFollowUp(form)).rejects.toThrow(/not confirmed/)
  })

  it('getActiveAdoptions deja solo las ACTIVA', async () => {
    api.get.mockResolvedValue([
      { id: 1, adoptionId: 'AD-1', status: 'ACTIVA', adopter: { id: 9 } },
      { id: 2, adoptionId: 'AD-2', status: 'FINALIZADA', adopter: { id: 9 } },
    ])
    const list = await getActiveAdoptions()
    expect(api.get).toHaveBeenCalledWith('/adoptions')
    expect(list).toEqual([{ id: 1, adoptionId: 'AD-1', adopter: 'Adoptante #9', status: 'ACTIVA' }])
  })

  it('getPets mapea specie a species', async () => {
    api.get.mockResolvedValue([{ id: 1, name: 'Luna', specie: 'Perro' }])
    expect(await getPets()).toEqual([{ id: 1, name: 'Luna', species: 'Perro' }])
  })

  it('getVets junta los veterinarios de todos los refugios', async () => {
    api.get.mockImplementation(async (path) => {
      if (path === '/shelters') return [{ id: 1 }, { id: 2 }]
      if (path === '/shelters/1/veterinarians') return [{ id: 10, veterinarianId: 'V-1', specialty: 'General' }]
      return [{ id: 11, veterinarianId: 'V-2' }]
    })
    expect(await getVets()).toEqual([
      { id: 10, name: 'V-1 · General' },
      { id: 11, name: 'V-2' },
    ])
  })
})
