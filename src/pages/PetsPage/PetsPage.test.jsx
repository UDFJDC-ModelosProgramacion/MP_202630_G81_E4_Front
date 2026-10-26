import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetsPage from './PetsPage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('HU01 - Consultar mascotas disponibles', () => {
  it('Muestra las mascotas disponibles cargadas desde el servicio', async () => {
    const mockPets = [
      {
        id: 1,
        name: 'Mimi',
        species: 'Perro',
        breed: 'Criollo',
        age: 2,
        shelter: 'Refugio Central',
        adoptionStatus: 'Disponible',
        healthStatus: 'Sano'
      }
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPets
    }));

    render(
      <MemoryRouter>
        <PetsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mimi')).toBeInTheDocument();
      expect(screen.getByText(/Refugio Central/)).toBeInTheDocument();
    });
  });
});