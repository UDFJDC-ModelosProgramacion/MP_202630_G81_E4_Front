
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { adoptionRequestsApi } from '../../api/adoptionRequests'
import { adoptionsApi } from '../../api/adoptions'
import AdoptionsPage from './AdoptionsPage'

vi.mock('../../api/adoptionRequests', () => ({
  adoptionRequestsApi: {
    list: vi.fn(),
  },
}))

vi.mock('../../api/adoptions', () => ({
  adoptionsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Datos de prueba
const sample = [
  {
    id: 1,
    requestId: 'REQ-001',
    status: 'APROBADO',
    adopter: {
      id: 4,
      name: 'María Pérez',
    },
    pet: {
      id: 2,
      name: 'Max',
      specie: 'Perro',
      breed: 'Labrador',
      age: 3,
      photo: 'https://example.com/max.jpg',
      shelter: {
        name: 'Huellitas',
      },
    },
  },
  {
    id: 2,
    requestId: 'REQ-002',
    status: 'PENDIENTE',
    adopter: {
      id: 5,
      name: 'Carlos Ruiz',
    },
    pet: {
      id: 3,
      name: 'Luna',
    },
  },
  {
    id: 3,
    requestId: 'REQ-003',
    status: 'CANCELADO',
    adopter: {
      id: 6,
      name: 'Ana Torres',
    },
    pet: {
      id: 4,
      name: 'Rocky',
    },
  },
  {
    id: 4,
    requestId: 'REQ-004',
    status: ' aprobado ',
    adopter: {
      id: 7,
      name: 'Laura Gómez',
    },
    pet: {
      id: 5,
      name: 'Toby',
    },
  },
]

// Renderizar componente
function renderPage() {
  return render(
    <MemoryRouter>
      <AdoptionsPage />
    </MemoryRouter>,
  )
}

// Renderizar con solicitudes
async function renderWithRequests(requests = sample) {
  adoptionRequestsApi.list.mockResolvedValueOnce(requests)

  renderPage()

  await screen.findByRole('heading', {
    name: /HU04.*Registrar adopción/i,
  })

  await waitFor(() => {
    expect(adoptionRequestsApi.list).toHaveBeenCalled()
  })
}

// Obtener formulario
function getForm() {
  return screen
    .getByRole('button', {
      name: 'Registrar adopción',
    })
    .closest('form')
}

beforeEach(() => {
  vi.clearAllMocks()

  adoptionRequestsApi.list.mockResolvedValue(sample)
  adoptionsApi.create.mockResolvedValue({})
})

afterEach(() => {
  cleanup()
})

describe('HU04 - registrar adopción', () => {
  it('carga y muestra únicamente las solicitudes aprobadas', async () => {
    await renderWithRequests()

    expect(screen.getByText('María Pérez')).toBeInTheDocument()

    expect(
      screen.getByRole('option', {
        name: /REQ-004.*Laura Gómez.*Toby/,
      }),
    ).toBeInTheDocument()

    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
    expect(screen.queryByText('Ana Torres')).not.toBeInTheDocument()
  })

  it('muestra los datos de la solicitud seleccionada', async () => {
    await renderWithRequests()

    expect(screen.getByLabelText('Adoptante')).toHaveValue('María Pérez')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('Max · Perro · Labrador · 3 años')

    expect(screen.getByText('Huellitas')).toBeInTheDocument()
  })

  it('muestra la fotografía de la mascota cuando está disponible', async () => {
    await renderWithRequests()

    expect(
      screen.getByRole('img', { name: 'Max' }),
    ).toHaveAttribute('src', 'https://example.com/max.jpg')
  })

  it('permite cambiar la solicitud seleccionada', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(
      screen.getByLabelText('Solicitud aprobada'),
      '4',
    )

    expect(screen.getByLabelText('Adoptante')).toHaveValue('Laura Gómez')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('Toby')
  })

  it('muestra el estado ACTIVA en el formulario', async () => {
    await renderWithRequests()

    expect(screen.getByText('ACTIVA')).toBeInTheDocument()
  })

  it('muestra el resumen de adoptante, mascota y refugio', async () => {
    await renderWithRequests()

    expect(
      screen.getByRole('heading', {
        name: 'Resumen de la adopción',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Huellitas')).toBeInTheDocument()

    expect(
      screen.getByText('Solicitud de adopción aprobada'),
    ).toBeInTheDocument()

    expect(screen.getByText('Adoptante identificado')).toBeInTheDocument()
    expect(screen.getByText('Mascota identificada')).toBeInTheDocument()
  })

  it('muestra el mensaje vacío cuando no existen solicitudes aprobadas', async () => {
    await renderWithRequests([
      {
        id: 2,
        status: 'PENDIENTE',
        adopter: { id: 5, name: 'Carlos Ruiz' },
        pet: { id: 3, name: 'Luna' },
      },
    ])

    expect(
      screen.getByRole('heading', {
        name: 'No hay solicitudes aprobadas',
      }),
    ).toBeInTheDocument()
  })

  it('muestra el mensaje vacío cuando el servicio no devuelve un arreglo', async () => {
    await renderWithRequests(null)

    expect(
      screen.getByRole('heading', {
        name: 'No hay solicitudes aprobadas',
      }),
    ).toBeInTheDocument()
  })

  it('muestra un error cuando falla la carga inicial', async () => {
    adoptionRequestsApi.list.mockRejectedValueOnce(
      new Error('Error al cargar solicitudes'),
    )

    renderPage()

    expect(
      await screen.findByText('Error al cargar solicitudes'),
    ).toBeInTheDocument()
  })

  it('permite reintentar la carga después de un error', async () => {
    adoptionRequestsApi.list
      .mockRejectedValueOnce(new Error('Error al cargar solicitudes'))
      .mockResolvedValueOnce(sample)

    renderPage()

    await screen.findByText('Error al cargar solicitudes')

    await userEvent.click(
      screen.getByRole('button', { name: 'Reintentar' }),
    )

    expect(await screen.findByText('María Pérez')).toBeInTheDocument()

    await waitFor(() => {
      expect(adoptionRequestsApi.list).toHaveBeenCalledTimes(2)
    })
  })

  it('permite actualizar manualmente las solicitudes', async () => {
    await renderWithRequests()

    adoptionRequestsApi.list.mockResolvedValueOnce(sample)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Actualizar solicitudes',
      }),
    )

    await waitFor(() => {
      expect(adoptionRequestsApi.list).toHaveBeenCalledTimes(2)
    })
  })

  it('muestra un error si falla la actualización manual', async () => {
    await renderWithRequests()

    adoptionRequestsApi.list.mockRejectedValueOnce(
      new Error('No fue posible actualizar'),
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Actualizar solicitudes',
      }),
    )

    expect(
      await screen.findByText('No fue posible actualizar'),
    ).toBeInTheDocument()
  })

  it('registra correctamente una adopción', async () => {
    await renderWithRequests()

    adoptionsApi.create.mockResolvedValueOnce({})

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Registrar adopción',
      }),
    )

    expect(
      await screen.findByText('Adopción registrada correctamente.'),
    ).toBeInTheDocument()

    expect(adoptionsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        adoptionId: expect.stringMatching(/^AD-\d+$/),
        status: 'ACTIVA',
        date: expect.any(String),
        adopter: { id: 4 },
        pet: { id: 2 },
      }),
    )
  })

  it('envía la fecha seleccionada en el registro', async () => {
    await renderWithRequests()

    await userEvent.clear(screen.getByLabelText('Fecha de adopción'))

    await userEvent.type(
      screen.getByLabelText('Fecha de adopción'),
      '2026-10-15',
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Registrar adopción',
      }),
    )

    await waitFor(() => {
      expect(adoptionsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-10-15T00:00:00.000Z',
        }),
      )
    })
  })

  it('muestra un error cuando falla el registro de la adopción', async () => {
    await renderWithRequests()

    adoptionsApi.create.mockRejectedValueOnce(
      new Error('El servidor rechazó la adopción'),
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Registrar adopción',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El servidor rechazó la adopción',
    )
  })

  it('muestra el error de conexión cuando no se puede contactar al backend', async () => {
    await renderWithRequests()

    adoptionsApi.create.mockRejectedValueOnce(
      new Error(
        'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
      ),
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Registrar adopción',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible conectar con el servidor',
    )
  })

  it('permite limpiar la solicitud seleccionada', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(
      screen.getByLabelText('Solicitud aprobada'),
      '',
    )

    expect(screen.getByLabelText('Adoptante')).toHaveValue('—')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('—')
  })

  it('muestra un error si se intenta enviar sin seleccionar una solicitud', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(
      screen.getByLabelText('Solicitud aprobada'),
      '',
    )

    fireEvent.submit(getForm())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Debes seleccionar una solicitud aprobada.',
    )

    expect(adoptionsApi.create).not.toHaveBeenCalled()
  })

  it('valida que la solicitud tenga un adoptante y una mascota válidos', async () => {
    await renderWithRequests([
      {
        id: 10,
        status: 'APROBADO',
        adopter: null,
        pet: null,
      },
    ])

    fireEvent.submit(getForm())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La solicitud seleccionada no tiene un adoptante o una mascota válidos.',
    )

    expect(adoptionsApi.create).not.toHaveBeenCalled()
  })

  it('valida que la fecha de adopción esté diligenciada', async () => {
    await renderWithRequests()

    await userEvent.clear(screen.getByLabelText('Fecha de adopción'))

    fireEvent.submit(getForm())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Debes seleccionar la fecha de adopción.',
    )

    expect(adoptionsApi.create).not.toHaveBeenCalled()
  })

  it('cancela el formulario y restablece la selección', async () => {
    await renderWithRequests()

    await userEvent.selectOptions(
      screen.getByLabelText('Solicitud aprobada'),
      '4',
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Cancelar',
        exact: true,
      }),
    )

    expect(
      screen.getByLabelText('Solicitud aprobada'),
    ).toHaveValue('')

    expect(screen.getByLabelText('Adoptante')).toHaveValue('—')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('—')

    expect(adoptionsApi.create).not.toHaveBeenCalled()
  })

  it('muestra valores alternativos cuando faltan datos de la mascota', async () => {
    await renderWithRequests([
      {
        id: 20,
        status: 'APROBADO',
        adopter: {
          id: 8,
          firstName: 'Pedro',
          lastName: 'Gómez',
        },
        pet: {
          id: 9,
          nombre: 'Firulais',
          age: null,
          shelter: {
            nombre: 'Refugio alternativo',
          },
        },
      },
    ])

    expect(screen.getByLabelText('Adoptante')).toHaveValue('Pedro Gómez')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('Firulais')

    expect(screen.getByText('Refugio alternativo')).toBeInTheDocument()
    expect(screen.getByText('🐱')).toBeInTheDocument()
  })

  it('muestra identificadores alternativos cuando faltan nombres', async () => {
    await renderWithRequests([
      {
        id: 30,
        status: 'APROBADO',
        adopter: { id: 30 },
        pet: { id: 31 },
      },
    ])

    expect(screen.getByLabelText('Adoptante')).toHaveValue('ID 30')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('Mascota ID 31')
  })

  it('muestra un guion cuando los datos del adoptante y la mascota son nulos', async () => {
    await renderWithRequests([
      {
        id: 40,
        status: 'APROBADO',
        adopter: null,
        pet: null,
      },
    ])

    expect(screen.getByLabelText('Adoptante')).toHaveValue('—')

    expect(
      screen.getByRole('textbox', { name: 'Mascota' }),
    ).toHaveValue('—')

    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('muestra el identificador alternativo de la solicitud cuando no tiene requestId', async () => {
    await renderWithRequests([
      {
        id: 50,
        status: 'APROBADO',
        adopter: { id: 4, name: 'María Pérez' },
        pet: { id: 2, name: 'Max' },
      },
    ])

    expect(
      screen.getByRole('option', {
        name: /REQ-050/,
      }),
    ).toBeInTheDocument()
  })

  it('no muestra solicitudes con estados distintos de aprobado', async () => {
    await renderWithRequests([
      {
        id: 1,
        status: 'PENDIENTE',
        adopter: { id: 1, name: 'Pendiente' },
        pet: { id: 1, name: 'Mascota pendiente' },
      },
      {
        id: 2,
        status: 'CANCELADO',
        adopter: { id: 2, name: 'Cancelado' },
        pet: { id: 2, name: 'Mascota cancelada' },
      },
      {
        id: 3,
        status: null,
        adopter: { id: 3, name: 'Sin estado' },
        pet: { id: 3, name: 'Mascota sin estado' },
      },
    ])

    expect(
      screen.getByRole('heading', {
        name: 'No hay solicitudes aprobadas',
      }),
    ).toBeInTheDocument()

    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancelado')).not.toBeInTheDocument()
  })

  it('muestra el error cuando el registro falla inesperadamente', async () => {
    await renderWithRequests()

    adoptionsApi.create.mockRejectedValueOnce(
      new Error('Error inesperado'),
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Registrar adopción',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Error inesperado',
    )
  })
})
