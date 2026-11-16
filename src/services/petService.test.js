import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import { getAvailablePets } from './petService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn() },
}))

const petDto = {
  id: 1,
  name: 'Luna',
  specie: 'Perro',
  breed: 'Labrador',
  age: 2,
  adoptionStatus: 'Disponible',
  healthStatus: 'Sano',
  shelter: { id: 5, city: 'Bogotá' },
}

beforeEach(() => vi.clearAllMocks())

describe('petService', () => {
  it('consulta las mascotas y normaliza el PetDetailDTO', async () => {
    api.get.mockResolvedValue([petDto])

    const pets = await getAvailablePets()

    expect(api.get).toHaveBeenCalledWith('/pets')
    expect(pets).toEqual([
      {
        id: 1,
        name: 'Luna',
        species: 'Perro',
        breed: 'Labrador',
        age: 2,
        shelter: 'Bogotá',
        adoptionStatus: 'Disponible',
        healthStatus: 'Sano',
      },
    ])
  })

  it('usa "Sin refugio" cuando el DTO no trae refugio', async () => {
    api.get.mockResolvedValue([{ ...petDto, shelter: null }])

    const [pet] = await getAvailablePets()

    expect(pet.shelter).toBe('Sin refugio')
  })

  it('solo deja mascotas disponibles y con salud apta', async () => {
    api.get.mockResolvedValue([
      { ...petDto, id: 1, adoptionStatus: 'Disponible', healthStatus: 'Sano' },
      { ...petDto, id: 2, adoptionStatus: 'Adoptado', healthStatus: 'Sano' },
      { ...petDto, id: 3, adoptionStatus: 'Disponible', healthStatus: 'Enfermo' },
      { ...petDto, id: 4, adoptionStatus: 'Disponible', healthStatus: 'En tratamiento' },
      { ...petDto, id: 5, adoptionStatus: 'Disponible', healthStatus: 'En_tratamiento' },
    ])

    const pets = await getAvailablePets()

    expect(pets.map((p) => p.id)).toEqual([1])
  })

  it('filtra sin importar mayúsculas en los estados', async () => {
    api.get.mockResolvedValue([
      { ...petDto, id: 1, adoptionStatus: 'DISPONIBLE', healthStatus: 'SANO' },
      { ...petDto, id: 2, adoptionStatus: 'disponible', healthStatus: 'enfermo' },
    ])

    const pets = await getAvailablePets()

    expect(pets.map((p) => p.id)).toEqual([1])
  })

  it('devuelve una lista vacía cuando no hay mascotas', async () => {
    api.get.mockResolvedValue([])

    expect(await getAvailablePets()).toEqual([])
  })

  it('deja subir el error del back cuando la consulta falla', async () => {
    api.get.mockRejectedValue(new Error('Error interno del servidor.'))

    await expect(getAvailablePets()).rejects.toThrow('Error interno del servidor.')
  })
})
