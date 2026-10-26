import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdoptionRequestsPage from './AdoptionRequestsPage'

const sample = [
  { id: 1, requestId: 'REQ-001', dateRequest: '2026-10-09', status: 'PENDIENTE', adopter: { id: 4, name: 'María Pérez' }, pet: { id: 2, name: 'Max' }, description: '' },
  { id: 2, requestId: 'REQ-002', dateRequest: '2026-10-08', status: 'APROBADO', adopter: { id: 5, name: 'Carlos Ruiz' }, pet: { id: 3, name: 'Luna' }, description: '' },
  { id: 3, requestId: 'REQ-003', dateRequest: '2026-10-05', status: 'CANCELADO', adopter: { id: 6, name: 'Ana Torres' }, pet: { id: 4, name: 'Rocky' }, description: '' },
]

function renderPage() {
  return render(<MemoryRouter><AdoptionRequestsPage /></MemoryRouter>)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('HU03 - gestionar solicitudes de adopción', () => {
  it('muestra solicitudes y permite filtrar por estado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sample }))
    renderPage()
    expect(await screen.findByText('María Pérez')).toBeInTheDocument()
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'PENDIENTE')
    expect(screen.getByText('María Pérez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
  })

  it('muestra el mensaje del backend si falla la aprobación', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [sample[0]] })
      .mockResolvedValueOnce({ ok: false, status: 412, json: async () => ({ apierror: { message: 'Adopter already has an active Adoption' } }) }))
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Aprobar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Adopter already has an active Adoption')
  })

  it('permite iniciar la edición de una solicitud pendiente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sample }))
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    expect(screen.getByRole('heading', { name: 'Editar solicitud REQ-001' })).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de solicitud *')).toHaveValue('2026-10-09')
  })

  it('presenta un mensaje cuando la lista está vacía', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }))
    renderPage()
    expect(await screen.findByText('No se encontraron solicitudes con esos filtros.')).toBeInTheDocument()
  })
})
