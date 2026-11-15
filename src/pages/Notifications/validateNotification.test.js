import { describe, it, expect } from 'vitest'
import { validateNotification } from './validateNotification'

const valid = { userId: '5', adoptionId: '12', petId: '', channel: 'email', content: 'Hola' }

describe('validateNotification', () => {
  it('accepts a complete notification without a pet', () => {
    expect(validateNotification(valid)).toEqual({})
  })

  it('accepts a notification with a pet', () => {
    expect(validateNotification({ ...valid, petId: '2' })).toEqual({})
  })

  it('requires a recipient', () => {
    expect(validateNotification({ ...valid, userId: '' }).userId).toBeDefined()
  })

  it('requires a valid channel', () => {
    expect(validateNotification({ ...valid, channel: '' }).channel).toBeDefined()
    expect(validateNotification({ ...valid, channel: 'telegram' }).channel).toBeDefined()
  })

  it('requires the adoption to be a positive integer', () => {
    expect(validateNotification({ ...valid, adoptionId: '' }).adoptionId).toBeDefined()
    expect(validateNotification({ ...valid, adoptionId: '0' }).adoptionId).toBeDefined()
    expect(validateNotification({ ...valid, adoptionId: '-4' }).adoptionId).toBeDefined()
    expect(validateNotification({ ...valid, adoptionId: '2.5' }).adoptionId).toBeDefined()
  })

  it('requires the pet, when given, to be a positive integer', () => {
    expect(validateNotification({ ...valid, petId: '-3' }).petId).toBeDefined()
    expect(validateNotification({ ...valid, petId: 'abc' }).petId).toBeDefined()
  })

  it('requires content', () => {
    expect(validateNotification({ ...valid, content: '   ' }).content).toBeDefined()
  })

  it('reports every missing field at once', () => {
    const errors = validateNotification({
      userId: '',
      adoptionId: '',
      petId: '',
      channel: '',
      content: '',
    })
    expect(Object.keys(errors)).toHaveLength(4)
  })
})