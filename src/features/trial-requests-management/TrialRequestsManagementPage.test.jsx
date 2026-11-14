
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  render,
  screen,
  waitFor,
  cleanup,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrialRequestsManagementPage from './TrialRequestsManagementPage'

vi.mock('../../api/trialRequests', () => ({
  trialRequestsApi: {
    list: vi.fn(),
    update: vi.fn(),
  },
}))

import { trialRequestsApi } from '../../api/trialRequests'

const mockTrials = [
  {
    id: 1,
    trialId: 'TR-001',
    date: '2026-11-01T00:00:00',
    status: 'ACTIVA',
    description: 'Periodo de prueba de Rocky',
    adopter: { id: 12, name: 'Carlos Gómez' },
    pet: { id: 1, name: 'Rocky' },
    shelter: { id: 1, name: 'Huellitas' },
  },
  {
    id: 2,
    trialId: 'TR-002',
    date: '2026-10-15T00:00:00',
    status: 'FINALIZADA',
    description: 'Periodo completado',
    adopter: { id: 13, name: 'Laura Pérez' },
    pet: { id: 2, name: 'Luna' },
    shelter: { id: 2, name: 'Patitas' },
  },
  {
    id: 3,
    trialId: 'TR-003',
    date: '2026-10-20T00:00:00',
    status: 'CANCELADA',
    description: '',
    adopter: { id: 14, name: 'Andrés Ruiz' },
    pet: { id: 3, name: 'Max' },
    shelter: { id: 1, name: 'Huellitas' },
  },
]

async function renderPage(trials = mockTrials) {
  trialRequestsApi.list.mockResolvedValue(trials)

  render(<TrialRequestsManagementPage />)

  await screen.findByRole('heading', {
    name: /gestionar periodos de prueba/i,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('confirm', vi.fn(() => true))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('TrialRequestsManagementPage', () => {
  it('muestra la página después de cargar los periodos', async () => {
    await renderPage()

    expect(
      screen.getByRole('heading', {
        name: /gestionar periodos de prueba/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('TR-001')).toBeInTheDocument()
    expect(screen.getByText('TR-002')).toBeInTheDocument()
    expect(screen.getByText('TR-003')).toBeInTheDocument()
  })

  it('consulta los periodos al cargar la página', async () => {
    await renderPage()

    expect(trialRequestsApi.list).toHaveBeenCalledTimes(1)
  })

  it('muestra una tabla vacía cuando el backend devuelve null', async () => {
    await renderPage(null)

    expect(
      screen.getByText(/no se encontraron periodos de prueba/i),
    ).toBeInTheDocument()
  })

  it('muestra una tabla vacía cuando no existen periodos', async () => {
    await renderPage([])

    expect(
      screen.getByText(/no se encontraron periodos de prueba/i),
    ).toBeInTheDocument()
  })

  it('muestra los datos del adoptante, mascota y refugio', async () => {
    await renderPage()

    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument()
    expect(screen.getByText('Rocky')).toBeInTheDocument()

    const table = screen.getByRole('table')

    expect(
      within(table).getAllByText('Huellitas'),
    ).toHaveLength(2)
  })

  it('muestra el estado de cada periodo', async () => {
    await renderPage()

    expect(screen.getByText('ACTIVA')).toBeInTheDocument()
    expect(screen.getByText('FINALIZADA')).toBeInTheDocument()
    expect(screen.getByText('CANCELADA')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando falla la carga', async () => {
    trialRequestsApi.list.mockRejectedValueOnce(
      new Error('Error de conexión'),
    )

    render(<TrialRequestsManagementPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Error de conexión',
    )
  })

  it('permite reintentar la carga después de un error', async () => {
    const user = userEvent.setup()

    trialRequestsApi.list
      .mockRejectedValueOnce(new Error('Error de conexión'))
      .mockResolvedValueOnce(mockTrials)

    render(<TrialRequestsManagementPage />)

    await screen.findByRole('alert')

    await user.click(
      screen.getByRole('button', { name: /reintentar/i }),
    )

    expect(await screen.findByText('TR-001')).toBeInTheDocument()
    expect(trialRequestsApi.list).toHaveBeenCalledTimes(2)
  })

  it('busca periodos por nombre del adoptante', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.type(
      screen.getByRole('searchbox', {
        name: /buscar adoptante o mascota/i,
      }),
      'Carlos',
    )

    expect(screen.getByText('TR-001')).toBeInTheDocument()
    expect(screen.queryByText('TR-002')).not.toBeInTheDocument()
    expect(screen.queryByText('TR-003')).not.toBeInTheDocument()
  })

  it('busca periodos por nombre de mascota', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.type(
      screen.getByRole('searchbox', {
        name: /buscar adoptante o mascota/i,
      }),
      'Luna',
    )

    expect(screen.getByText('TR-002')).toBeInTheDocument()
    expect(screen.queryByText('TR-001')).not.toBeInTheDocument()
  })

  it('realiza la búsqueda sin distinguir mayúsculas y minúsculas', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.type(
      screen.getByRole('searchbox', {
        name: /buscar adoptante o mascota/i,
      }),
      'cArLoS',
    )

    expect(screen.getByText('TR-001')).toBeInTheDocument()
    expect(screen.queryByText('TR-002')).not.toBeInTheDocument()
  })

  it('permite mostrar todos los estados', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^estado$/i }),
      'FINALIZADA',
    )

    expect(screen.getByText('TR-002')).toBeInTheDocument()
    expect(screen.queryByText('TR-001')).not.toBeInTheDocument()

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^estado$/i }),
      'TODOS',
    )

    expect(screen.getByText('TR-001')).toBeInTheDocument()
    expect(screen.getByText('TR-002')).toBeInTheDocument()
    expect(screen.getByText('TR-003')).toBeInTheDocument()
  })

  it('filtra los periodos por refugio', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^refugio$/i }),
      'Patitas',
    )

    expect(screen.getByText('TR-002')).toBeInTheDocument()
    expect(screen.queryByText('TR-001')).not.toBeInTheDocument()
    expect(screen.queryByText('TR-003')).not.toBeInTheDocument()
  })

  it('combina búsqueda, estado y refugio', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.type(
      screen.getByRole('searchbox', {
        name: /buscar adoptante o mascota/i,
      }),
      'Carlos',
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^estado$/i }),
      'ACTIVA',
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^refugio$/i }),
      'Huellitas',
    )

    expect(screen.getByText('TR-001')).toBeInTheDocument()
    expect(screen.queryByText('TR-002')).not.toBeInTheDocument()
    expect(screen.queryByText('TR-003')).not.toBeInTheDocument()
  })

  it('muestra el detalle de un periodo', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')

    await user.click(row.querySelector('button'))

    expect(
      screen.getByRole('dialog', {
        name: /detalle del periodo de prueba/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Periodo de prueba de Rocky')).toBeInTheDocument()
  })

  it('permite cerrar el detalle de un periodo', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')

    await user.click(row.querySelector('button'))

    await user.click(
      screen.getByRole('button', { name: /cerrar/i }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('permite abrir el formulario de actualización', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')
    const buttons = row.querySelectorAll('button')

    await user.click(buttons[1])

    expect(
      screen.getByRole('heading', {
        name: /actualizar periodo de prueba/i,
      }),
    ).toBeInTheDocument()
  })

  it('no permite actualizar periodos finalizados', async () => {
    await renderPage()

    const row = screen.getByText('TR-002').closest('tr')
    const buttons = row.querySelectorAll('button')

    expect(buttons[1]).toBeDisabled()
  })

  it('no permite actualizar periodos cancelados', async () => {
    await renderPage()

    const row = screen.getByText('TR-003').closest('tr')
    const buttons = row.querySelectorAll('button')

    expect(buttons[1]).toBeDisabled()
  })

  it('actualiza correctamente un periodo activo', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')
    const buttons = row.querySelectorAll('button')

    await user.click(buttons[1])

    const description = screen.getByRole('textbox', {
      name: /descripción/i,
    })

    await user.clear(description)
    await user.type(description, 'Periodo actualizado')

    trialRequestsApi.update.mockResolvedValue({
      ...mockTrials[0],
      description: 'Periodo actualizado',
    })

    await user.click(
      screen.getByRole('button', { name: /guardar cambios/i }),
    )

    await waitFor(() => {
      expect(trialRequestsApi.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          description: 'Periodo actualizado',
        }),
      )
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Periodo de prueba actualizado correctamente.',
    )
  })

  it('muestra un error cuando falla la actualización', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')

    await user.click(row.querySelectorAll('button')[1])

    trialRequestsApi.update.mockRejectedValueOnce(
      new Error('No se pudo actualizar'),
    )

    await user.click(
      screen.getByRole('button', { name: /guardar cambios/i }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo actualizar',
    )
  })

  it('finaliza un periodo activo después de confirmar', async () => {
    const user = userEvent.setup()

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')
    const buttons = row.querySelectorAll('button')

    trialRequestsApi.update.mockResolvedValueOnce({
      ...mockTrials[0],
      status: 'FINALIZADA',
    })

    await user.click(buttons[2])

    await waitFor(() => {
      expect(trialRequestsApi.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: 'FINALIZADA',
        }),
      )
    })

    expect(confirm).toHaveBeenCalled()
  })

  it('no finaliza un periodo cuando el usuario cancela la confirmación', async () => {
    const user = userEvent.setup()

    confirm.mockReturnValueOnce(false)

    await renderPage()

    const row = screen.getByText('TR-001').closest('tr')
    const buttons = row.querySelectorAll('button')

    await user.click(buttons[2])

    expect(confirm).toHaveBeenCalled()
    expect(trialRequestsApi.update).not.toHaveBeenCalled()
  })

  it('no permite finalizar periodos finalizados', async () => {
    await renderPage()

    const row = screen.getByText('TR-002').closest('tr')
    const buttons = row.querySelectorAll('button')

    expect(buttons[2]).toBeDisabled()
  })

  it('no permite finalizar periodos cancelados', async () => {
    await renderPage()

    const row = screen.getByText('TR-003').closest('tr')
    const buttons = row.querySelectorAll('button')

    expect(buttons[2]).toBeDisabled()
  })

  it('muestra un error cuando falla la finalización', async () => {
    const user = userEvent.setup()

    await renderPage()

    trialRequestsApi.update.mockRejectedValueOnce(
      new Error('No se pudo finalizar'),
    )

    const row = screen.getByText('TR-001').closest('tr')
    const buttons = row.querySelectorAll('button')

    await user.click(buttons[2])

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo finalizar',
    )
  })

  it('muestra valores alternativos cuando faltan datos', async () => {
    await renderPage([
      {
        id: 4,
        status: 'ACTIVA',
      },
    ])

    expect(screen.getByText('#4')).toBeInTheDocument()
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0)
  })

  it('muestra un estado predeterminado cuando no existe estado', async () => {
    await renderPage([
      {
        id: 5,
        adopter: { name: 'Pedro' },
        pet: { name: 'Toby' },
        shelter: { name: 'Huellitas' },
      },
    ])

    expect(screen.getByText('PENDIENTE')).toBeInTheDocument()
  })

  it('maneja fechas inválidas o ausentes', async () => {
    await renderPage([
      {
        id: 6,
        status: 'ACTIVA',
        date: 'fecha-invalida',
      },
      {
        id: 7,
        status: 'ACTIVA',
      },
    ])

    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0)
  })

  it('permite filtrar por estado ACTIVE', async () => {
    const user = userEvent.setup()

    await renderPage([
      {
        id: 8,
        status: 'ACTIVE',
        adopter: { name: 'Pedro' },
        pet: { name: 'Toby' },
        shelter: { name: 'Huellitas' },
      },
    ])

    await user.selectOptions(
      screen.getByRole('combobox', { name: /^estado$/i }),
      'ACTIVE',
    )

    expect(screen.getByText('#8')).toBeInTheDocument()
  })

  it('muestra un mensaje genérico cuando el error no tiene mensaje', async () => {
    trialRequestsApi.list.mockRejectedValueOnce({})

    render(<TrialRequestsManagementPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible completar la operación.',
    )
  })
})
