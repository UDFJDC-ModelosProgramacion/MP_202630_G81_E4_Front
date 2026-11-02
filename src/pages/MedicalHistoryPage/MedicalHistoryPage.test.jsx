import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MedicalHistoryPage from './MedicalHistoryPage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderWithRouter = (ui, { route = '/pets/1/medical-history' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/pets/:petId/medical-history" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('HU09 - Consultar historial médico', () => {
  it('1. Muestra el historial si la mascota y el historial existen', async () => {
    const mockData = {
      pet: { name: 'Max', species: 'Perro', age: 3, weight: 15, shelter: 'Huellas de Amor' },
      history: { isSterilized: true, diseases: 'Dermatitis atópica', treatment: 'Champú medicado', lastUpdate: '10/05/2026' }
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    }));

    renderWithRouter(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Dermatitis atópica')).toBeInTheDocument();
      expect(screen.getByText('Champú medicado')).toBeInTheDocument();
    });
  });

  it('2. Muestra mensaje de error si la mascota no existe (404)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    }));

    renderWithRouter(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('La mascota indicada no fue encontrada.')).toBeInTheDocument();
    });
  });

  it('3. Muestra mensaje si la mascota existe pero no tiene historial', async () => {
    const mockData = {
      pet: { name: 'Luna', species: 'Gato', age: 1, weight: 4, shelter: 'Gatitos Felices' },
      history: null // Sin historial
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    }));

    renderWithRouter(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Esta mascota aún no tiene un historial médico registrado.')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });
});
