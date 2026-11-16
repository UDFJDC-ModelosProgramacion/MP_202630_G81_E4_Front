import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_USER } from '../config/currentUser'
import { api } from './apiClient'
import { createReview, getPet, getReviews } from './reviewService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('reviewService', () => {
  it('returns an existing pet with the shape the screen uses', async () => {
    api.get.mockResolvedValue({
      id: 1,
      name: 'Luna',
      breed: 'Labrador',
      age: 2,
      sex: 'F',
      size: 'M',
      adoptionStatus: 'DISPONIBLE',
      shelter: { id: 1 },
    })

    const pet = await getPet('1')

    expect(api.get).toHaveBeenCalledWith('/pets/1')
    expect(pet).toEqual({
      id: 1,
      name: 'Luna',
      breed: 'Labrador',
      age: 2,
      sex: 'F',
      size: 'M',
      status: 'DISPONIBLE',
    })
  })

  it('lets the error of the back go up when the pet does not exist', async () => {
    api.get.mockRejectedValue(new Error('Mascota no encontrada'))

    await expect(getPet('999')).rejects.toThrow('Mascota no encontrada')
  })

  it('returns the reviews of a pet with the adopter name', async () => {
    api.get.mockResolvedValue([
      { id: 1, rating: 5, comment: 'Excelente', date: '2026-10-01', adopter: { id: 4, name: 'Ana' } },
      { id: 2, rating: 3, comment: 'Regular', date: '2026-10-02', adopter: null },
    ])

    const reviews = await getReviews('1')

    expect(api.get).toHaveBeenCalledWith('/pets/1/reviews')
    expect(reviews).toEqual([
      { id: 1, adopterName: 'Ana', rating: 5, comment: 'Excelente', date: '2026-10-01' },
      { id: 2, adopterName: 'Adoptante', rating: 3, comment: 'Regular', date: '2026-10-02' },
    ])
  })

  it('returns an empty list for a pet without reviews', async () => {
    api.get.mockResolvedValue([])

    expect(await getReviews('999')).toEqual([])
  })

  it('creates a review sending the pet and the current adopter by id', async () => {
    api.post.mockResolvedValue({
      id: 10,
      rating: 4,
      comment: 'Muy buena',
      date: '2026-11-02T00:00:00Z',
    })

    const created = await createReview('1', { rating: 4, comment: 'Muy buena' })

    expect(api.post).toHaveBeenCalledWith('/reviews', {
      rating: 4,
      comment: 'Muy buena',
      date: expect.any(String),
      pet: { id: 1 },
      adopter: { id: CURRENT_USER.adopterId },
    })
    expect(created).toEqual({
      id: 10,
      adopterName: CURRENT_USER.name,
      rating: 4,
      comment: 'Muy buena',
      date: '2026-11-02T00:00:00Z',
    })
  })

  it('lets the error of the back go up when the review cannot be created', async () => {
    api.post.mockRejectedValue(new Error('Mascota no encontrada'))

    await expect(createReview('999', { rating: 5, comment: 'Hola' })).rejects.toThrow(
      'Mascota no encontrada',
    )
  })
})