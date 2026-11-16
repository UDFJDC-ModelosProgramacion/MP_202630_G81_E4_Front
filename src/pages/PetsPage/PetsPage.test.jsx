import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetsPage from './PetsPage';
import { getAvailablePets } from '../../services/petService';

vi.mock('../../services/petService', () => ({
  getAvailablePets: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PetsPage />
    </MemoryRouter>,
  );

describe('HU01 - Consultar mascotas disponibles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Muestra las mascotas disponibles cargadas desde el servicio', async () => {
    getAvailablePets.mockResolvedValue([
      {
        id: 1,
        name: 'Mimi',
        species: 'Perro',
        breed: 'Criollo',
        age: 2,
        shelter: 'Refugio Central',
        adoptionStatus: 'Disponible',
        healthStatus: 'Sano',
      },
    ]);

    renderPage();

    expect(await screen.findByText('Mimi')).toBeInTheDocument();
    expect(screen.getByText(/Refugio Central/)).toBeInTheDocument();
  });

  it('Muestra un mensaje cuando no hay mascotas', async () => {
    getAvailablePets.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText(/No se encontraron mascotas/i),
    ).toBeInTheDocument();
  });

  it('Muestra el error del servicio', async () => {
    getAvailablePets.mockRejectedValue(new Error('Error al consultar las mascotas'));

    renderPage();

    expect(
      await screen.findByText(/Error al consultar las mascotas/i),
    ).toBeInTheDocument();
  });
});
