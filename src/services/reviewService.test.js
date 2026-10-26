import { describe, it, expect } from 'vitest'
import { getPet, getReviews, createReview } from './reviewService'

describe('reviewService', () => {
  it('returns an existing pet', async () => {
    const pet = await getPet('1')
    expect(pet.name).toBe('Luna')
  })

  it('rejects when the pet does not exist', async () => {
    await expect(getPet('999')).rejects.toThrow('Mascota no encontrada')
  })

  it('returns the reviews of a pet', async () => {
    const reviews = await getReviews('1')
    expect(reviews.length).toBeGreaterThanOrEqual(3)
  })

  it('returns an empty list for a pet without reviews', async () => {
    expect(await getReviews('999')).toEqual([])
  })

  it('adds a new review at the top of the list', async () => {
    const created = await createReview('1', { rating: 4, comment: '  Muy buena  ' })
    expect(created.comment).toBe('Muy buena')
    const reviews = await getReviews('1')
    expect(reviews[0].id).toBe(created.id)
  })

  it('does not create a review for a pet that does not exist', async () => {
    await expect(createReview('999', { rating: 5, comment: 'Hola' })).rejects.toThrow(
      'Mascota no encontrada',
    )
  })
})