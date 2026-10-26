import { describe, it, expect } from 'vitest'
import { validateReview } from './validateReview'

describe('validateReview', () => {
  it('accepts a valid review', () => {
    expect(validateReview({ rating: 4, comment: 'Muy buena' })).toEqual({})
  })

  it('rejects a missing rating', () => {
    expect(validateReview({ rating: 0, comment: 'Muy buena' }).rating).toBeDefined()
  })

  it('rejects a rating above 5', () => {
    expect(validateReview({ rating: 6, comment: 'Muy buena' }).rating).toBeDefined()
  })

  it('rejects a rating that is not an integer', () => {
    expect(validateReview({ rating: 3.5, comment: 'Muy buena' }).rating).toBeDefined()
  })

  it('rejects an empty comment', () => {
    expect(validateReview({ rating: 4, comment: '   ' }).comment).toBeDefined()
  })
})