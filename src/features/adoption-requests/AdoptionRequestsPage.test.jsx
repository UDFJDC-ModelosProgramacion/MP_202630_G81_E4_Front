
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { adoptionRequestsApi } from '../../api/adoptionRequests'
import AdoptionRequestsPage from './AdoptionRequestsPage'

vi.mock('../../api/adoptionRequests', () => ({
  adoptionRequestsApi: {
    list: vi.fn(),
    update: vi.fn(),
  },
}))

const sample = [
  {
    id: 1,
    requestId: 'REQ-001',
    dateRequest: '2026-10-09',
    status: 'PENDIENTE',
    adopter: { id: 4, name: 'María Pérez' },
    pet: { id: 2, name: 'Max' },
    description: 'Primera solicitud',
  },
  {
    id: 2,
    requestId: 'REQ-002',
    dateRequest: '2026-10-08',
    status: 'APROBADO',
    adopter: { id: 5, name: 'Carlos Ruiz' },
    pet: { id: 3, name: 'Luna' },
    description: '',
  },
  {
    id: 3,
    requestId: 'REQ-003',
    dateRequest: '2026-10-05',
    status: 'CANCELADO',
    adopter: { id: 6, name: 'Ana Torres' },
    pet: { id: 4, name: 'Rocky' },
    description: '',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <AdoptionRequestsPage />
    </MemoryRouter>,
  )
}

async function renderWithRequests(requests = sample) {
  adoptionRequestsApi.list.mockResolvedValueOnce(requests)

  renderPage()

  await screen.findByRole('heading', {
    name: /HU03.*Gestionar solicitudes de adopción/i,
  })

  await waitFor(() => {
    expect(adoptionRequestsApi.list).toHaveBeenCalled()
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  adoptionRequestsApi.update.mockResolvedValue({})
})

afterEach(() => {
  cleanup()
})

describe('HU03 - gestionar solicitudes de adopción', () => {
  it('carga y muestra las solicitudes con sus estados y fechas', async () => {
    await renderWithRequests()

    expect(await screen.findByText('María Pérez')).toBeInTheDocument()
    expect(screen.getAllByText('Max')).toHaveLength(2)
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
    expect(screen.getAllByText('Luna')).toHaveLength(2)

    expect(
      screen.getByText('Pendiente', { selector: 'span' }),
    ).toBeInTheDocument()

    expect(screen.getAllByText('Aprobada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThan(0)
  })

  it('muestra una lista vacía cuando el servicio no devuelve un arreglo', async () => {
    await renderWithRequests(null)

    expect(
      screen.getByText('No se encontraron solicitudes con esos filtros.'),
    ).toBeInTheDocument()
  })

  it('muestra un error de carga y permite reintentar', async () => {
    adoptionRequestsApi.list
      .mockRejectedValueOnce(new Error('Error al cargar solicitudes'))
      .mockResolvedValueOnce(sample)

    renderPage()

    expect(
      await screen.findByText('Error al cargar solicitudes'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('María Pérez')).toBeInTheDocument()
  })

  it('permite actualizar manualmente la lista', async () => {
    await renderWithRequests()

    adoptionRequestsApi.list.mockResolvedValueOnce(sample)

    await userEvent.click(
      screen.getByRole('button', { name: 'Actualizar lista' }),
    )

    await waitFor(() => {
      expect(adoptionRequestsApi.list).toHaveBeenCalledTimes(2)
    })
  })

  it('muestra un error cuando falla la actualización manual', async () => {
    await renderWithRequests()

    adoptionRequestsApi.list.mockRejectedValueOnce(
      new Error('No fue posible actualizar'),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Actualizar lista' }),
    )

    expect(
      await screen.findByText('No fue posible actualizar'),
    ).toBeInTheDocument()
  })

  it('filtra por estado y permite volver a mostrar todos los estados', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'PENDIENTE')

    expect(screen.getByText('María Pérez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'TODOS')

    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
  })

  it('filtra por mascota', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(screen.getByLabelText('Mascota'), '3')

    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
    expect(screen.queryByText('María Pérez')).not.toBeInTheDocument()
  })

  it('combina búsqueda, estado y mascota', async () => {
    await renderWithRequests()

    await userEvent.type(
      screen.getByPlaceholderText('Adoptante, mascota o código'),
      'María',
    )

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'PENDIENTE')
    await userEvent.selectOptions(screen.getByLabelText('Mascota'), '2')

    expect(screen.getByText('María Pérez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
  })

  it('no encuentra coincidencias si la búsqueda no coincide', async () => {
    await renderWithRequests()

    await userEvent.type(
      screen.getByPlaceholderText('Adoptante, mascota o código'),
      'Persona inexistente',
    )

    expect(
      screen.getByText('No se encontraron solicitudes con esos filtros.'),
    ).toBeInTheDocument()
  })

  it('busca sin distinguir mayúsculas y minúsculas y elimina espacios externos', async () => {
    await renderWithRequests()

    await userEvent.type(
      screen.getByPlaceholderText('Adoptante, mascota o código'),
      '  MARÍA  ',
    )

    expect(screen.getByText('María Pérez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
  })

  it('aprueba una solicitud y vuelve a cargar la lista', async () => {
    await renderWithRequests()

    adoptionRequestsApi.update.mockResolvedValueOnce({})
    adoptionRequestsApi.list.mockResolvedValueOnce(sample)

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Aprobar' })[0],
    )

    expect(
      await screen.findByText('Solicitud aprobada correctamente.'),
    ).toBeInTheDocument()

    expect(adoptionRequestsApi.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        id: 1,
        status: 'APROBADO',
        adopter: { id: 4 },
        pet: { id: 2 },
      }),
    )

    await waitFor(() => {
      expect(adoptionRequestsApi.list).toHaveBeenCalledTimes(2)
    })
  })

  it('cancela una solicitud y muestra la confirmación', async () => {
    await renderWithRequests()

    adoptionRequestsApi.update.mockResolvedValueOnce({})
    adoptionRequestsApi.list.mockResolvedValueOnce(sample)

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Cancelar' })[0],
    )

    expect(
      await screen.findByText('Solicitud cancelada correctamente.'),
    ).toBeInTheDocument()

    expect(adoptionRequestsApi.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: 'CANCELADO' }),
    )
  })

  it('muestra el error del backend si falla la aprobación', async () => {
    await renderWithRequests()

    adoptionRequestsApi.update.mockRejectedValueOnce(
      new Error('Adopter already has an active Adoption'),
    )

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Aprobar' })[0],
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Adopter already has an active Adoption',
    )
  })

  it('muestra el error del backend si falla la cancelación', async () => {
    await renderWithRequests()

    adoptionRequestsApi.update.mockRejectedValueOnce(
      new Error('No se puede cancelar la solicitud'),
    )

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Cancelar' })[0],
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se puede cancelar la solicitud',
    )
  })

  it('muestra los detalles de una solicitud que no está pendiente', async () => {
    await renderWithRequests()

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Ver detalle' })[0],
    )

    expect(screen.getByRole('status')).toHaveTextContent('REQ-002')
    expect(screen.getByRole('status')).toHaveTextContent('Carlos Ruiz')
    expect(screen.getByRole('status')).toHaveTextContent('Luna')
  })

  it('abre el formulario de edición con los datos existentes', async () => {
    await renderWithRequests()

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Editar' })[0],
    )

    expect(
      screen.getByRole('heading', { name: 'Editar solicitud REQ-001' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Fecha de solicitud *')).toHaveValue(
      '2026-10-09',
    )

    expect(screen.getByLabelText('Descripción')).toHaveValue(
      'Primera solicitud',
    )
  })

  it('guarda los cambios de una solicitud y recarga los datos', async () => {
    await renderWithRequests()

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Editar' })[0],
    )

    await userEvent.clear(screen.getByLabelText('Fecha de solicitud *'))
    await userEvent.type(
      screen.getByLabelText('Fecha de solicitud *'),
      '2026-10-15',
    )

    await userEvent.clear(screen.getByLabelText('Descripción'))
    await userEvent.type(
      screen.getByLabelText('Descripción'),
      'Descripción actualizada',
    )

    adoptionRequestsApi.update.mockResolvedValueOnce({})
    adoptionRequestsApi.list.mockResolvedValueOnce(sample)

    await userEvent.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(
      await screen.findByText('Solicitud actualizada correctamente.'),
    ).toBeInTheDocument()

    expect(adoptionRequestsApi.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        dateRequest: '2026-10-15T00:00:00.000Z',
        description: 'Descripción actualizada',
        status: 'PENDIENTE',
        adopter: { id: 4 },
        pet: { id: 2 },
      }),
    )

    await waitFor(() => {
      expect(adoptionRequestsApi.list).toHaveBeenCalledTimes(2)
    })
  })

  it('muestra un error si falla el guardado de la edición', async () => {
    await renderWithRequests()

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Editar' })[0],
    )

    adoptionRequestsApi.update.mockRejectedValueOnce(
      new Error('No se pudieron guardar los cambios'),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron guardar los cambios',
    )
  })

  it('permite cancelar la edición sin guardar', async () => {
    await renderWithRequests()

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Editar' })[0],
    )

    expect(
      screen.getByRole('heading', { name: 'Editar solicitud REQ-001' }),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancelar edición' }),
    )

    expect(
      screen.queryByRole('heading', { name: 'Editar solicitud REQ-001' }),
    ).not.toBeInTheDocument()

    expect(adoptionRequestsApi.update).not.toHaveBeenCalled()
  })

  it('muestra valores alternativos cuando faltan datos de la solicitud', async () => {
    await renderWithRequests([
      {
        id: 9,
        status: '',
        dateRequest: 'fecha-invalida',
        adopter: { id: 9 },
        pet: { id: 9 },
      },
      {
        id: 10,
        status: null,
        dateRequest: null,
        adopter: null,
        pet: null,
      },
      {
        id: 11,
        status: 'ESTADO_DESCONOCIDO',
        dateRequest: '2026-10-10',
        adopter: {
          firstName: 'Pedro',
          lastName: 'Gómez',
        },
        pet: { nombre: 'Firulais' },
      },
    ])

    expect(screen.getByText('REQ-009')).toBeInTheDocument()
    expect(screen.getByText('ID 9', { exact: true })).toBeInTheDocument()

    expect(
      screen.getAllByText('Mascota ID 9', { exact: true }),
    ).toHaveLength(2)

    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sin estado').length).toBeGreaterThan(0)
    expect(screen.getByText('Pedro Gómez')).toBeInTheDocument()
    expect(screen.getAllByText('Firulais')).toHaveLength(2)
  })

  it('normaliza los estados alternativos APROBADA y CANCELADA', async () => {
    await renderWithRequests([
      {
        id: 20,
        requestId: 'REQ-020',
        status: 'APROBADA',
        dateRequest: '2026-10-10',
        adopter: { name: 'Laura' },
        pet: { name: 'Toby' },
      },
      {
        id: 21,
        requestId: 'REQ-021',
        status: 'CANCELADA',
        dateRequest: '2026-10-11',
        adopter: { name: 'Andrés' },
        pet: { name: 'Milo' },
      },
    ])

    expect(screen.getAllByText('Aprobada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('button', { name: 'Ver detalle' }),
    ).toHaveLength(2)
  })

  it('permite editar una solicitud con fecha y descripción nulas', async () => {
    await renderWithRequests([
      {
        id: 30,
        requestId: 'REQ-030',
        status: 'PENDIENTE',
        dateRequest: null,
        description: null,
        adopter: null,
        pet: null,
      },
    ])

    await userEvent.click(
      screen.getByRole('button', { name: 'Editar' }),
    )

    expect(screen.getByLabelText('Fecha de solicitud *')).toHaveValue('')
    expect(screen.getByLabelText('Descripción')).toHaveValue('')

    expect(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeDisabled()
  })

  it('muestra una respuesta de detalle con datos alternativos', async () => {
    await renderWithRequests([
      {
        id: 40,
        requestId: '',
        status: 'APROBADO',
        dateRequest: '2026-10-12',
        adopter: { fullName: 'Nombre Completo' },
        pet: { nombre: 'Pelusa' },
      },
    ])

    expect(screen.getByText('REQ-040')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalle' }),
    )

    expect(screen.getByRole('status')).toHaveTextContent('Solicitud #40')
    expect(screen.getByRole('status')).toHaveTextContent('Nombre Completo')
    expect(screen.getByRole('status')).toHaveTextContent('Pelusa')
  })
})
