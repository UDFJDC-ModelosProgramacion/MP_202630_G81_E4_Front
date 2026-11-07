
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrialRequestPage from './TrialRequestPage'
import { CURRENT_USER } from '../../config/currentUser'

vi.mock('../../services/petService', () => ({
  getAvailablePets: vi.fn(),
}))

vi.mock('../../services/shelterService', () => ({
  getShelters: vi.fn(),
}))

vi.mock('../../api/trialRequests', () => ({
  trialRequestsApi: {
    list: vi.fn(),
    create: vi.fn(),
  },
}))

import { getAvailablePets } from '../../services/petService'
import { getShelters } from '../../services/shelterService'
import { trialRequestsApi } from '../../api/trialRequests'

const mockPets = [
  {
    id: 1,
    name: 'Rocky',
    species: 'PERRO',
    breed: 'Labrador',
    age: 3,
    adoptionStatus: 'DISPONIBLE',
    shelter: { id: 1, name: 'Huellitas' },
  },
  {
    id: 2,
    name: 'Luna',
    species: 'GATO',
    breed: 'Criollo',
    age: 2,
    adoptionStatus: 'DISPONIBLE',
    shelter: { id: 2, name: 'Patitas' },
  },
]

const mockShelters = [
  { id: 1, name: 'Huellitas' },
  { id: 2, name: 'Patitas' },
]

const emptyTrials = []

async function renderPage({
  pets = mockPets,
  shelters = mockShelters,
  trials = emptyTrials,
} = {}) {
  getAvailablePets.mockResolvedValue(pets)
  getShelters.mockResolvedValue(shelters)
  trialRequestsApi.list.mockResolvedValue(trials)

  render(<TrialRequestPage />)

  await screen.findByRole('heading', {
    name: /datos de la solicitud/i,
  })
}

function getPetSelect() {
  return screen.getByRole('combobox', { name: /^mascota$/i })
}

function getShelterSelect() {
  return screen.getByRole('combobox', { name: /^refugio$/i })
}

function getSubmitButton() {
  return screen.getByRole('button', {
    name: /solicitar periodo de prueba/i,
  })
}

async function selectValidData(user) {
  await user.selectOptions(getPetSelect(), '1')
  await user.selectOptions(getShelterSelect(), '1')
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('TrialRequestPage', () => {
  it('muestra el formulario después de cargar los datos', async () => {
    await renderPage()

    expect(
      screen.getByRole('heading', { name: /datos de la solicitud/i }),
    ).toBeInTheDocument()

    expect(getPetSelect()).toBeInTheDocument()
    expect(getShelterSelect()).toBeInTheDocument()
  })

  it('consulta mascotas, refugios y periodos de prueba', async () => {
    await renderPage()

    expect(getAvailablePets).toHaveBeenCalled()
    expect(getShelters).toHaveBeenCalled()
    expect(trialRequestsApi.list).toHaveBeenCalled()
  })

  it('maneja respuestas que no son arreglos', async () => {
    await renderPage({
      pets: null,
      shelters: null,
      trials: null,
    })

    expect(getPetSelect()).toBeInTheDocument()
    expect(getShelterSelect()).toBeInTheDocument()
  })

  it('muestra un error si falla la carga de datos', async () => {
    getAvailablePets.mockRejectedValueOnce(
      new Error('Error al cargar las mascotas'),
    )
    getShelters.mockResolvedValue([])
    trialRequestsApi.list.mockResolvedValue([])

    render(<TrialRequestPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Error al cargar las mascotas',
    )

    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument()
  })

  it('muestra la información de la mascota seleccionada', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(getPetSelect(), '1')

    expect(
      screen.getByRole('heading', { name: 'Rocky' }),
    ).toBeInTheDocument()

    expect(screen.getByText(/Labrador/)).toBeInTheDocument()
  })

  it('muestra el icono correspondiente a la especie de la mascota', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(getPetSelect(), '2')

    expect(
      screen.getByRole('heading', { name: 'Luna' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Imagen de mascota')).toHaveTextContent('🐱')
  })

  it('selecciona automáticamente el refugio de la mascota', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(getPetSelect(), '1')

    expect(getShelterSelect()).toHaveValue('1')
  })

  it('muestra los datos alternativos cuando faltan datos de la mascota', async () => {
    const user = userEvent.setup()

    await renderPage({
      pets: [
        {
          id: 3,
          shelter: { id: 1, name: 'Huellitas' },
          adoptionStatus: 'DISPONIBLE',
        },
      ],
    })

    await user.selectOptions(getPetSelect(), '3')

    expect(
      screen.getByRole('heading', { name: 'Mascota 3' }),
    ).toBeInTheDocument()
  })

  it('no permite enviar sin seleccionar una mascota', async () => {
    await renderPage()

    expect(getPetSelect()).toHaveValue('')
    expect(trialRequestsApi.create).not.toHaveBeenCalled()
  })

  it('muestra un error si no hay un usuario adoptante configurado', async () => {
    const user = userEvent.setup()
    const originalAdopterId = CURRENT_USER.adopterId

    try {
      CURRENT_USER.adopterId = null

      await renderPage()
      await selectValidData(user)
      await user.click(getSubmitButton())

      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(trialRequestsApi.create).not.toHaveBeenCalled()
    } finally {
      CURRENT_USER.adopterId = originalAdopterId
    }
  })

  it('impide solicitar otro periodo si el adoptante ya tiene uno activo', async () => {
    const user = userEvent.setup()

    await renderPage({
      trials: [
        {
          id: 10,
          status: 'ACTIVA',
          adopter: { id: 12 },
          pet: { id: 2 },
        },
      ],
    })

    await selectValidData(user)
    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(trialRequestsApi.create).not.toHaveBeenCalled()
  })

  it('impide solicitar un periodo si la mascota ya tiene uno activo', async () => {
    const user = userEvent.setup()

    await renderPage({
      trials: [
        {
          id: 11,
          status: 'ACTIVE',
          adopter: { id: 20 },
          pet: { id: 1 },
        },
      ],
    })

    await selectValidData(user)
    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(trialRequestsApi.create).not.toHaveBeenCalled()
  })

  it('permite solicitar un periodo cuando los anteriores están finalizados', async () => {
    const user = userEvent.setup()

    await renderPage({
      trials: [
        {
          id: 12,
          status: 'FINALIZADA',
          adopter: { id: 12 },
          pet: { id: 1 },
        },
      ],
    })

    await selectValidData(user)
    trialRequestsApi.create.mockResolvedValue({ id: 20 })

    await user.click(getSubmitButton())

    expect(trialRequestsApi.create).toHaveBeenCalledTimes(1)
  })

  it('no bloquea periodos activos de otros adoptantes y otras mascotas', async () => {
    const user = userEvent.setup()

    await renderPage({
      trials: [
        {
          id: 13,
          status: 'ACTIVA',
          adopter: { id: 99 },
          pet: { id: 99 },
        },
      ],
    })

    await selectValidData(user)
    trialRequestsApi.create.mockResolvedValue({ id: 21 })

    await user.click(getSubmitButton())

    expect(trialRequestsApi.create).toHaveBeenCalledTimes(1)
  })

  it('crea correctamente una solicitud de periodo de prueba', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockResolvedValue({ id: 20 })

    await user.click(getSubmitButton())

    expect(trialRequestsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ACTIVA',
        description: expect.any(String),
        adopter: { id: 12 },
        shelter: { id: 1 },
        pet: { id: 1 },
      }),
    )

    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('muestra el error devuelto al fallar la creación', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockRejectedValueOnce(
      new Error('No fue posible crear la solicitud'),
    )

    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible crear la solicitud',
    )
  })

  it('muestra un mensaje genérico si el error no tiene mensaje', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockRejectedValueOnce({})

    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible completar la solicitud.',
    )
  })

  it('actualiza la lista después de crear una solicitud', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockResolvedValue({ id: 22 })

    await user.click(getSubmitButton())

    await waitFor(() => {
      expect(trialRequestsApi.list.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('muestra error si falla la recarga posterior al envío', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockResolvedValue({ id: 20 })
    trialRequestsApi.list.mockRejectedValueOnce(
      new Error('Error al actualizar los periodos'),
    )

    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Error al actualizar los periodos',
    )
  })

  it('limpia los campos al cancelar', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    await user.clear(screen.getByLabelText(/descripción/i))

    await user.click(
      screen.getByRole('button', { name: /cancelar/i }),
    )

    expect(getPetSelect()).toHaveValue('')
    expect(getShelterSelect()).toHaveValue('')
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('')
  })

  it('limpia los mensajes cuando cambia la mascota', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    trialRequestsApi.create.mockRejectedValueOnce(
      new Error('Error de prueba'),
    )

    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.selectOptions(getPetSelect(), '2')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('permite modificar la descripción', async () => {
    const user = userEvent.setup()

    await renderPage()

    const description = screen.getByLabelText(/descripción/i)

    await user.clear(description)
    await user.type(description, 'Quiero cuidar a esta mascota')

    expect(description).toHaveValue('Quiero cuidar a esta mascota')
  })

  it('envía la fecha seleccionada en el formato esperado', async () => {
    const user = userEvent.setup()

    await renderPage()
    await selectValidData(user)

    const dateInput = screen.getByLabelText(/fecha de inicio/i)

    await user.clear(dateInput)
    await user.type(dateInput, '2026-11-15')

    trialRequestsApi.create.mockResolvedValue({ id: 25 })

    await user.click(getSubmitButton())

    expect(trialRequestsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-11-15T00:00:00.000Z',
      }),
    )
  })

  it('muestra el refugio seleccionado cuando se cambia manualmente', async () => {
    const user = userEvent.setup()

    await renderPage()

    await user.selectOptions(getShelterSelect(), '2')

    expect(getShelterSelect()).toHaveValue('2')
  })

  it('muestra el estado de carga mientras se consultan los datos', async () => {
    let resolvePets

    getAvailablePets.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePets = resolve
        }),
    )
    getShelters.mockResolvedValue(mockShelters)
    trialRequestsApi.list.mockResolvedValue(emptyTrials)

    render(<TrialRequestPage />)

    expect(screen.getByText(/cargando/i)).toBeInTheDocument()

    resolvePets(mockPets)

    expect(
      await screen.findByRole('heading', {
        name: /datos de la solicitud/i,
      }),
    ).toBeInTheDocument()
  })
})
