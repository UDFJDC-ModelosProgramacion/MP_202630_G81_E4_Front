import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetAdoptionRequests } from '../../services/adoptionRequestService'
import { resetAdopters } from '../../services/adopterService'
import ProfilePage from './ProfilePage'

describe('ProfilePage (HU12)', () => {
  beforeEach(() => {
    resetAdopters()
    resetAdoptionRequests()
  })

  it('shows the data and the counters of the adopter', async () => {
    render(<ProfilePage />)
    expect(await screen.findByRole('heading', { name: 'María Gómez' })).toBeInTheDocument()
    expect(screen.getByText('Adoptante · ID 12')).toBeInTheDocument()
    expect(screen.getByLabelText(/Dirección/)).toHaveValue('Carrera 7 # 40-10, Bogotá')
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('310 555 6677')
    expect(screen.getByLabelText(/Ocupación/)).toHaveValue('Ingeniera')
    expect(screen.getByText('Solicitudes').previousSibling).toHaveTextContent('3')
    expect(screen.getByText('Adopciones').previousSibling).toHaveTextContent('1')
    expect(screen.getByText('Reseñas').previousSibling).toHaveTextContent('2')
  })

  it('saves the changes', async () => {
    render(<ProfilePage />)
    const occupation = await screen.findByLabelText(/Ocupación/)
    await userEvent.clear(occupation)
    await userEvent.type(occupation, 'Médica')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Cambios guardados.')
    expect(screen.getByLabelText(/Ocupación/)).toHaveValue('Médica')
  })

  it('does not save without address and tells why', async () => {
    render(<ProfilePage />)
    await userEvent.clear(await screen.findByLabelText(/Dirección/))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La dirección del adoptante es obligatoria.',
    )
  })

  it('does not save without phone and tells why', async () => {
    render(<ProfilePage />)
    await userEvent.clear(await screen.findByLabelText(/Teléfono/))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El teléfono del adoptante es obligatorio.',
    )
  })

  it('discards the unsaved changes', async () => {
    render(<ProfilePage />)
    const phone = await screen.findByLabelText(/Teléfono/)
    await userEvent.clear(phone)
    await userEvent.type(phone, '999')
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('310 555 6677')
  })

  it('does not allow deleting an adopter that has records', async () => {
    render(<ProfilePage />)
    expect(await screen.findByText(/No disponible: tienes adopciones/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar mi registro' })).toBeDisabled()
  })

  it('deletes an adopter that has no records', async () => {
    render(<ProfilePage adopterId={13} />)
    const deleteButton = await screen.findByRole('button', { name: 'Eliminar mi registro' })
    expect(deleteButton).toBeEnabled()
    await userEvent.click(deleteButton)
    expect(await screen.findByText('Tu registro de adoptante fue eliminado.')).toBeInTheDocument()
  })

  it('tells when the adopter does not exist', async () => {
    render(<ProfilePage adopterId={999} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('El adoptante con ID 999 no existe.')
  })
})
