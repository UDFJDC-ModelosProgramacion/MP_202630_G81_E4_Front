const isBlank = (value) => !value || value.trim() === ''

export function validateVeterinarian({ name, license, phone }) {
  const errors = {}
  if (isBlank(name)) {
    errors.name = 'El nombre es obligatorio.'
  }
  if (isBlank(license)) {
    errors.license = 'La licencia es obligatoria.'
  }
  if (isBlank(phone)) {
    errors.phone = 'El teléfono es obligatorio.'
  }
  return errors
}