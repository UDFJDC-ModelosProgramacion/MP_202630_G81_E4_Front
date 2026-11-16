import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './apiClient'
import { getMedicalHistory, saveMedicalHistory } from './manageMedicalHistoryService'

// Se mockea solo 'api' y se conserva la clase real ApiError, porque el
// service usa 'error instanceof ApiError' para tratar el 404.
vi.mock('./apiClient', async () => {
  const actual = await vi.importActual('./apiClient')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }
})

beforeEach(() => vi.clearAllMocks())

describe('manageMedicalHistoryService', () => {
  describe('getMedicalHistory', () => {
    it('lee el historial anidado y lo normaliza con su id', async () => {
      api.get.mockResolvedValue({
        id: 1,
        medicalHistory: {
          id: 9,
          sterilized: true,
          vaccine: 'Rabia',
          diseases: 'Dermatitis',
          treatment: 'Champú',
        },
      })

      const data = await getMedicalHistory(1)

      expect(api.get).toHaveBeenCalledWith('/pets/1')
      expect(data).toEqual({
        history: {
          id: 9,
          isSterilized: true,
          vaccine: 'Rabia',
          diseases: 'Dermatitis',
          treatment: 'Champú',
        },
      })
    })

    it('devuelve null cuando la mascota no tiene historial', async () => {
      api.get.mockResolvedValue({ id: 1, medicalHistory: null })

      expect(await getMedicalHistory(1)).toBeNull()
    })

    it('devuelve null cuando la mascota no existe (404)', async () => {
      api.get.mockRejectedValue(new ApiError(404, 'Not found'))

      expect(await getMedicalHistory(999)).toBeNull()
    })

    it('deja subir otros errores del back', async () => {
      api.get.mockRejectedValue(new ApiError(500, 'Error interno del servidor.'))

      await expect(getMedicalHistory(1)).rejects.toThrow('Error interno del servidor.')
    })
  })

  describe('saveMedicalHistory', () => {
    it('crea con POST cuando no hay historyId y mapea isSterilized a sterilized', async () => {
      api.post.mockResolvedValue({ id: 5 })

      await saveMedicalHistory(1, { isSterilized: true, diseases: 'Gripe', treatment: 'Reposo' })

      expect(api.post).toHaveBeenCalledWith('/pets/1/medical-histories', {
        sterilized: true,
        diseases: 'Gripe',
        treatment: 'Reposo',
      })
      expect(api.put).not.toHaveBeenCalled()
    })

    it('actualiza con PUT por id del historial cuando hay historyId', async () => {
      api.put.mockResolvedValue({ id: 9 })

      await saveMedicalHistory(1, { isSterilized: true, diseases: '', treatment: '' }, 9)

      expect(api.put).toHaveBeenCalledWith('/medical-histories/9', {
        sterilized: true,
        diseases: '',
        treatment: '',
      })
      expect(api.post).not.toHaveBeenCalled()
    })

    it('incluye la vacuna en el body solo cuando viene definida', async () => {
      api.put.mockResolvedValue({ id: 9 })

      await saveMedicalHistory(
        1,
        { isSterilized: true, diseases: '', treatment: '', vaccine: 'Rabia' },
        9,
      )

      expect(api.put).toHaveBeenCalledWith('/medical-histories/9', {
        sterilized: true,
        diseases: '',
        treatment: '',
        vaccine: 'Rabia',
      })
    })

    it('omite la vacuna cuando es undefined o null', async () => {
      api.post.mockResolvedValue({ id: 5 })

      await saveMedicalHistory(1, {
        isSterilized: false,
        diseases: '',
        treatment: '',
        vaccine: null,
      })

      const body = api.post.mock.calls[0][1]
      expect(body).not.toHaveProperty('vaccine')
    })

    it('deja subir el error de negocio del back', async () => {
      api.put.mockRejectedValue(
        new ApiError(400, 'Una mascota esterilizada no puede cambiar su estado a no esterilizada.'),
      )

      await expect(
        saveMedicalHistory(1, { isSterilized: false, diseases: '', treatment: '' }, 9),
      ).rejects.toThrow('Una mascota esterilizada no puede cambiar su estado a no esterilizada.')
    })
  })
})
