import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './apiClient'
import { getMedicalHistory } from './medicalHistoryService'

// Se mockea solo 'api' y se conserva la clase real ApiError, porque el
// service usa 'error instanceof ApiError' para traducir el 404.
vi.mock('./apiClient', async () => {
  const actual = await vi.importActual('./apiClient')
  return { ...actual, api: { get: vi.fn() } }
})

const petDto = {
  id: 1,
  name: 'Luna',
  specie: 'Perro',
  age: 2,
  weight: 18,
  shelter: { id: 5, city: 'Bogotá' },
  medicalHistory: {
    id: 9,
    sterilized: true,
    vaccine: 'Rabia',
    diseases: 'Dermatitis',
    treatment: 'Champú medicado',
  },
}

beforeEach(() => vi.clearAllMocks())

describe('medicalHistoryService', () => {
  it('lee el historial anidado en el pet y lo normaliza para la vista', async () => {
    api.get.mockResolvedValue(petDto)

    const data = await getMedicalHistory(1)

    expect(api.get).toHaveBeenCalledWith('/pets/1')
    expect(data).toEqual({
      pet: { id: 1, name: 'Luna', species: 'Perro', age: 2, weight: 18, shelter: 'Bogotá' },
      history: {
        isSterilized: true,
        vaccine: 'Rabia',
        diseases: 'Dermatitis',
        treatment: 'Champú medicado',
      },
    })
  })

  it('devuelve history en null cuando la mascota no tiene historial', async () => {
    api.get.mockResolvedValue({ ...petDto, medicalHistory: null })

    const data = await getMedicalHistory(1)

    expect(data.history).toBeNull()
    expect(data.pet.name).toBe('Luna')
  })

  it('usa "Sin refugio" cuando el pet no trae refugio', async () => {
    api.get.mockResolvedValue({ ...petDto, shelter: null })

    const data = await getMedicalHistory(1)

    expect(data.pet.shelter).toBe('Sin refugio')
  })

  it('traduce el 404 al mensaje de mascota no encontrada', async () => {
    api.get.mockRejectedValue(new ApiError(404, 'Not found'))

    await expect(getMedicalHistory(999)).rejects.toThrow('La mascota indicada no fue encontrada.')
  })

  it('deja subir otros errores del back sin traducirlos', async () => {
    api.get.mockRejectedValue(new ApiError(500, 'Error interno del servidor.'))

    await expect(getMedicalHistory(1)).rejects.toThrow('Error interno del servidor.')
  })
})
