import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FollowUpForm from '../components/FollowUp/FollowUpForm'
import * as service from '../services/followUpService'

vi.mock('../services/followUpService')

function renderForm(route = '/follow-ups/new') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/follow-ups/new" element={<FollowUpForm />} />
        <Route path="/follow-ups/:id/edit" element={<FollowUpForm />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HU07 - FollowUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.getActiveAdoptions.mockResolvedValue([
      { id: 'AD-101', adopter: 'Carlos Ruiz', status: 'ACTIVA' },
    ])
    service.getPets.mockResolvedValue([{ id: 1, name: 'Toby', species: 'Canino' }])
    service.getVets.mockResolvedValue([{ id: 1, name: 'Dr. Juan Parrado' }])
    service.createFollowUp.mockResolvedValue({ id: 'FU-005' })
    service.getFollowUpById.mockResolvedValue({
      id: 'FU-001',
      adoptionId: 'AD-101',
      petId: 1,
      vetId: 1,
      date: '2026-09-05',
      notes: 'Nota inicial',
      status: 'Programado',
    })
    service.updateFollowUp.mockResolvedValue({ id: 'FU-001' })
  })

  it('muestra el formulario de registro con campos obligatorios', async () => {
    renderForm()
    await waitFor(() => {
      expect(screen.getByLabelText(/adopción activa/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/mascota/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/veterinario responsable/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de seguimiento/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar seguimiento/i })).toBeInTheDocument()
  })

  it('valida campos obligatorios antes de enviar', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByLabelText(/adopción activa/i))
    await user.click(screen.getByRole('button', { name: /guardar seguimiento/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/seleccione una adopción/i)
    expect(service.createFollowUp).not.toHaveBeenCalled()
  })

  it('registra un seguimiento cuando el formulario es válido', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByLabelText(/adopción activa/i))

    await user.selectOptions(screen.getByLabelText(/adopción activa/i), 'AD-101')
    await user.selectOptions(screen.getByLabelText(/mascota/i), '1')
    await user.selectOptions(screen.getByLabelText(/veterinario responsable/i), '1')
    await user.type(screen.getByLabelText(/fecha de seguimiento/i), '2026-10-29')
    await user.click(screen.getByRole('button', { name: /guardar seguimiento/i }))

    await waitFor(() => {
      expect(service.createFollowUp).toHaveBeenCalledWith(
        expect.objectContaining({ adoptionId: 'AD-101', petId: 1, vetId: 1 }),
      )
    })
    expect(await screen.findByRole('status')).toHaveTextContent(/registrado correctamente/i)
  })

  it('muestra error del backend cuando la adopción no es válida', async () => {
    service.createFollowUp.mockRejectedValueOnce(
      new Error('La adopción indicada no existe o no está activa'),
    )
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByLabelText(/adopción activa/i))

    await user.selectOptions(screen.getByLabelText(/adopción activa/i), 'AD-101')
    await user.selectOptions(screen.getByLabelText(/mascota/i), '1')
    await user.selectOptions(screen.getByLabelText(/veterinario responsable/i), '1')
    await user.type(screen.getByLabelText(/fecha de seguimiento/i), '2026-10-29')
    await user.click(screen.getByRole('button', { name: /guardar seguimiento/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/adopción indicada no existe/i)
  })

  it('carga datos existentes en modo edición', async () => {
    renderForm('/follow-ups/FU-001/edit')
    await waitFor(() => {
      expect(service.getFollowUpById).toHaveBeenCalledWith('FU-001')
    })
    expect(
      await screen.findByRole('heading', { name: /actualizar seguimiento veterinario/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de seguimiento/i)).toHaveValue('2026-09-05')
    expect(screen.getByLabelText(/notas/i)).toHaveValue('Nota inicial')
  })

  it('permite programar el seguimiento inicial (estado Programado)', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByLabelText(/adopción activa/i))

    const statusSelect = screen.getByLabelText(/estado/i)
    expect(statusSelect).toHaveValue('Programado')

    await user.selectOptions(screen.getByLabelText(/adopción activa/i), 'AD-101')
    await user.selectOptions(screen.getByLabelText(/mascota/i), '1')
    await user.selectOptions(screen.getByLabelText(/veterinario responsable/i), '1')
    await user.type(screen.getByLabelText(/fecha de seguimiento/i), '2026-11-05')
    await user.click(screen.getByRole('button', { name: /guardar seguimiento/i }))

    await waitFor(() => {
      expect(service.createFollowUp).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Programado', date: '2026-11-05' }),
      )
    })
  })
})
