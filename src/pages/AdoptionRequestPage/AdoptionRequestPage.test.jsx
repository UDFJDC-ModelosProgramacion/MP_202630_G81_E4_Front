import { beforeEach, describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { resetAdoptionRequests } from '../../services/adoptionRequestService'
import { resetAdopters } from '../../services/adopterService'
import AdoptionRequestPage from './AdoptionRequestPage'

function renderPage(path = '/adoptions/new') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/adoptions/new" element={<AdoptionRequestPage />} />
        <Route path="/adoptions" element={<p>Pantalla de adopciones</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdoptionRequestPage (HU02)', () => {
  beforeEach(() => {
    resetAdopters()
    resetAdoptionRequests()
  })

  it('shows the form with the adopter and the pending status', async () => {
    renderPage()
    expect(await screen.findByLabelText('Adoptante')).toHaveValue('María Gómez (ID 12)')
    expect(screen.getByLabelText('Estado')).toHaveValue('PENDIENTE')
    expect(screen.getByLabelText(/Mascota/)).toHaveValue('')
  })

  it('lists the requests of the adopter with their status', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Mis solicitudes' })
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument()
    expect(screen.getByText('APROBADO')).toBeInTheDocument()
    expect(screen.getByText('CANCELADO')).toBeInTheDocument()
  })

  it('preselects the pet received in the address', async () => {
    renderPage('/adoptions/new?petId=3')
    expect(await screen.findByLabelText(/Mascota/)).toHaveValue('3')
  })

  it('registers a request and shows it in the list', async () => {
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '4')
    await userEvent.type(screen.getByLabelText('Descripción'), 'Tengo un patio cercado.')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Solicitud registrada para Toby.')
    expect(screen.getByText('Toby')).toBeInTheDocument()
    expect(screen.getByLabelText(/Mascota/)).toHaveValue('')
  })

  it('does not register a request without pet', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('debes seleccionar una mascota válida')
  })

  it('does not register a request for a pet that was already adopted', async () => {
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('la mascota ya fue adoptada')
  })

  it('does not register a request without date', async () => {
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '4')
    fireEvent.change(screen.getByLabelText(/Fecha de solicitud/), { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'la fecha de solicitud es obligatoria',
    )
  })

  it('does not register a second pending request for the same pet', async () => {
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '1')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ya tienes una solicitud pendiente para esta mascota',
    )
  })

  it('goes back to adoptions when the user cancels', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Pantalla de adopciones')).toBeInTheDocument()
  })
})
