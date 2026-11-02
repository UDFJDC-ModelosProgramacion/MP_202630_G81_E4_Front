import { describe, it, expect } from 'vitest'
import { validateVeterinarian } from './validateVeterinarian'

const valid = { name: 'Dra. Ana', license: 'MV-1', phone: '300 000 0000' }

describe('validateVeterinarian', () => {
  it('accepts a complete veterinarian', () => {
    expect(validateVeterinarian(valid)).toEqual({})
  })

  it('reports a missing name', () => {
    expect(validateVeterinarian({ ...valid, name: '' })).toEqual({
      name: 'El nombre es obligatorio.',
    })
  })

  it('reports a missing license', () => {
    expect(validateVeterinarian({ ...valid, license: '' })).toEqual({
      license: 'La licencia es obligatoria.',
    })
  })

  it('reports a missing phone', () => {
    expect(validateVeterinarian({ ...valid, phone: '' })).toEqual({
      phone: 'El teléfono es obligatorio.',
    })
  })

  it('treats blank spaces as missing', () => {
    expect(validateVeterinarian({ ...valid, name: '   ' }).name).toBeDefined()
  })

  it('reports every missing field at once', () => {
    expect(Object.keys(validateVeterinarian({ name: '', license: '', phone: '' }))).toHaveLength(3)
  })
})