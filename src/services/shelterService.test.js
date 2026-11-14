import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './apiClient'
import {
  createShelter,
  deleteShelter,
  getShelterById,
  getShelters,
  toShelterPayload,
  updateShelter,
} from './shelterService'

vi.mock('./apiClient', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

const form = { nit: ' 900123 ', city: ' Bogotá ', capacity: 40, description: 'Perros', photo: 'a.png', video: '' }

describe('shelterService (HU13, conectado al back)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('toShelterPayload arma el body que espera el back (nit numérico, capacity string)', () => {
    expect(toShelterPayload(form)).toEqual({
      nit: 900123,
      description: 'Perros',
      capacity: '40',
      city: 'Bogotá',
      photo: 'a.png',
      video: '',
    })
  })

  it('getShelters y getShelterById usan /shelters', async () => {
    api.get.mockResolvedValue([{ id: 1 }])
    expect(await getShelters()).toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/shelters')
    await getShelterById(2)
    expect(api.get).toHaveBeenCalledWith('/shelters/2')
  })

  it('createShelter hace POST con el payload traducido', async () => {
    api.post.mockResolvedValue({ id: 3 })
    await createShelter(form)
    expect(api.post).toHaveBeenCalledWith('/shelters', expect.objectContaining({ nit: 900123, city: 'Bogotá' }))
  })

  it('updateShelter hace PUT y deleteShelter hace DELETE', async () => {
    await updateShelter(4, form)
    expect(api.put).toHaveBeenCalledWith('/shelters/4', expect.objectContaining({ capacity: '40' }))
    await deleteShelter(4)
    expect(api.delete).toHaveBeenCalledWith('/shelters/4')
  })

  it('deja subir el error del back', async () => {
    api.delete.mockRejectedValue(new Error('No se puede eliminar el shelter porque tiene mascotas registradas'))
    await expect(deleteShelter(1)).rejects.toThrow(/tiene mascotas/)
  })
})
