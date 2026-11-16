import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import { deleteAdopter, getAdopter, getAdopterSummary, updateAdopter } from './adopterService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const adopterDto = {
  id: 1,
  address: 'Carrera 7 # 40-10, Bogotá',
  phone: '310 555 6677',
  occupation: 'Ingeniera',
}

beforeEach(() => vi.clearAllMocks())

describe('adopterService', () => {
  describe('getAdopter', () => {
    it('gets the adopter by id', async () => {
      api.get.mockResolvedValue(adopterDto)

      const adopter = await getAdopter(1)

      expect(api.get).toHaveBeenCalledWith('/adopters/1')
      expect(adopter).toEqual(adopterDto)
    })

    it('uses empty texts when the back does not bring an optional field', async () => {
      api.get.mockResolvedValue({ id: 2, address: null, phone: null })

      expect(await getAdopter(2)).toEqual({ id: 2, address: '', phone: '', occupation: '' })
    })

    it('lets the not found error of the back go up', async () => {
      api.get.mockRejectedValue(new Error('El adoptante con ID 99 no existe.'))

      await expect(getAdopter(99)).rejects.toThrow('El adoptante con ID 99 no existe.')
    })
  })

  describe('updateAdopter', () => {
    it('sends only the editable fields and returns the saved adopter', async () => {
      api.put.mockResolvedValue({ ...adopterDto, occupation: 'Médica' })

      const saved = await updateAdopter(1, {
        address: adopterDto.address,
        phone: adopterDto.phone,
        occupation: 'Médica',
        ignored: 'campo extra',
      })

      expect(api.put).toHaveBeenCalledWith('/adopters/1', {
        address: adopterDto.address,
        phone: adopterDto.phone,
        occupation: 'Médica',
      })
      expect(saved.occupation).toBe('Médica')
    })

    it('lets the validation error of the back go up when a field is missing', async () => {
      api.put.mockRejectedValue(new Error('El teléfono del adoptante es obligatorio.'))

      await expect(
        updateAdopter(1, { address: 'Calle 1', phone: '', occupation: '' }),
      ).rejects.toThrow('El teléfono del adoptante es obligatorio.')
    })

    it('lets the business rule error of the back go up when there is a request', async () => {
      api.put.mockRejectedValue(
        new Error(
          'No se puede modificar la dirección de un adoptante con solicitudes de adopción en curso.',
        ),
      )

      await expect(updateAdopter(1, adopterDto)).rejects.toThrow('solicitudes de adopción en curso')
    })
  })

  describe('deleteAdopter', () => {
    it('deletes the adopter', async () => {
      api.delete.mockResolvedValue(null)

      await deleteAdopter(3)

      expect(api.delete).toHaveBeenCalledWith('/adopters/3')
    })

    it('lets the business rule error of the back go up when it has records', async () => {
      api.delete.mockRejectedValue(
        new Error('No se puede eliminar un adoptante que tiene adopciones registradas.'),
      )

      await expect(deleteAdopter(1)).rejects.toThrow('tiene adopciones registradas')
    })
  })

  describe('getAdopterSummary', () => {
    it('counts only the requests and adoptions of the adopter, and all its reviews', async () => {
      api.get.mockImplementation(async (path) => {
        if (path === '/adoption-requests') {
          return [{ adopter: { id: 1 } }, { adopter: { id: 1 } }, { adopter: { id: 2 } }, { adopter: null }]
        }
        if (path === '/adoptions') return [{ adopter: { id: 1 } }, { adopter: { id: 2 } }]
        if (path === '/adopters/1/reviews') return [{ id: 10 }, { id: 11 }, { id: 12 }]
        throw new Error(`unexpected ${path}`)
      })

      expect(await getAdopterSummary(1)).toEqual({
        requestsCount: 2,
        adoptionsCount: 1,
        reviewsCount: 3,
      })
    })

    it('returns zeros for an adopter without records', async () => {
      api.get.mockResolvedValue([])

      expect(await getAdopterSummary(5)).toEqual({
        requestsCount: 0,
        adoptionsCount: 0,
        reviewsCount: 0,
      })
    })

    it('lets the error of the back go up when a listing fails', async () => {
      api.get.mockRejectedValue(new Error('No hay conexión con el servidor.'))

      await expect(getAdopterSummary(1)).rejects.toThrow('No hay conexión con el servidor.')
    })
  })
})
