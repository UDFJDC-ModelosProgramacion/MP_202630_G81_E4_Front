import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './apiClient'
import {
  createVeterinarian,
  deleteVeterinarian,
  getShelterSummary,
  listVeterinarians,
  updateVeterinarian,
} from './veterinarianService'

vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const dto = {
  id: 7,
  veterinarianId: 'MV-10231',
  specialty: 'Cirugía',
  availability: 'Lunes a viernes',
  name: 'Dra. Laura Gómez',
  phone: '310 555 0101',
  shelter: { id: 1 },
}

const veterinarian = {
  id: 7,
  name: 'Dra. Laura Gómez',
  license: 'MV-10231',
  specialty: 'Cirugía',
  phone: '310 555 0101',
}

const formData = {
  name: 'Dra. Laura Gómez',
  license: 'MV-10231',
  specialty: 'Cirugía',
  phone: '310 555 0101',
}

const body = {
  name: 'Dra. Laura Gómez',
  veterinarianId: 'MV-10231',
  specialty: 'Cirugía',
  phone: '310 555 0101',
}

describe('veterinarianService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the id and name of the shelter', async () => {
    api.get.mockResolvedValue({ id: 1, name: 'Huellitas del Norte', capacity: 20 })

    expect(await getShelterSummary('1')).toEqual({ id: 1, name: 'Huellitas del Norte' })
    expect(api.get).toHaveBeenCalledWith('/shelters/1')
  })

  it('lists the veterinarians of a shelter in the shape the screens use', async () => {
    api.get.mockResolvedValue([dto])

    expect(await listVeterinarians('1')).toEqual([veterinarian])
    expect(api.get).toHaveBeenCalledWith('/shelters/1/veterinarians')
  })

  it('creates a veterinarian under the shelter', async () => {
    api.post.mockResolvedValue(dto)

    expect(await createVeterinarian('1', formData)).toEqual(veterinarian)
    expect(api.post).toHaveBeenCalledWith('/shelters/1/veterinarians', body)
  })

  it('trims the fields before sending them', async () => {
    api.post.mockResolvedValue(dto)

    await createVeterinarian('1', {
      name: '  Dra. Laura Gómez ',
      license: ' MV-10231 ',
      specialty: ' Cirugía  ',
      phone: ' 310 555 0101 ',
    })

    expect(api.post).toHaveBeenCalledWith('/shelters/1/veterinarians', body)
  })

  it('updates a veterinarian through its own route', async () => {
    api.put.mockResolvedValue({ ...dto, specialty: 'Medicina general' })

    const updated = await updateVeterinarian('1', 7, { ...formData, specialty: 'Medicina general' })

    expect(updated.specialty).toBe('Medicina general')
    expect(api.put).toHaveBeenCalledWith('/veterinarians/7', {
      ...body,
      specialty: 'Medicina general',
    })
  })

  it('deletes a veterinarian through its own route', async () => {
    api.delete.mockResolvedValue()

    await deleteVeterinarian('1', 7)

    expect(api.delete).toHaveBeenCalledWith('/veterinarians/7')
  })

  it('lets the error of the back reach the screen', async () => {
    api.post.mockRejectedValue(new Error('Ya existe un veterinario con esa licencia'))

    await expect(createVeterinarian('1', formData)).rejects.toThrow(
      'Ya existe un veterinario con esa licencia',
    )
  })
})