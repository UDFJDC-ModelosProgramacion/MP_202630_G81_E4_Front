import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MedicalHistoryPage from './MedicalHistoryPage';
import { getMedicalHistory } from '../../services/medicalHistoryService';

vi.mock('../../services/medicalHistoryService', () => ({
  getMedicalHistory: vi.fn(),
}));

const renderWithRouter = (route = '/pets/1/medical-history') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/pets/:petId/medical-history"
          element={<MedicalHistoryPage />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe('HU09 - Consultar historial médico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Muestra el historial si la mascota y el historial existen', async () => {
    getMedicalHistory.mockResolvedValue({
      pet: { name: 'Max', species: 'Perro', age: 3, weight: 15, shelter: 'Huellas de Amor' },
      history: {
        isSterilized: true,
        diseases: 'Dermatitis atópica',
        treatment: 'Champú medicado',
        lastUpdate: '10/05/2026',
      },
    });

    renderWithRouter();

    expect(await screen.findByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Dermatitis atópica')).toBeInTheDocument();
    expect(screen.getByText('Champú medicado')).toBeInTheDocument();
  });

  it('2. Muestra mensaje de error si la mascota no existe (404)', async () => {
    getMedicalHistory.mockRejectedValue(
      new Error('La mascota indicada no fue encontrada.'),
    );

    renderWithRouter();

    expect(
      await screen.findByText('La mascota indicada no fue encontrada.'),
    ).toBeInTheDocument();
  });

  it('3. Muestra mensaje si la mascota existe pero no tiene historial', async () => {
    getMedicalHistory.mockResolvedValue({
      pet: { name: 'Luna', species: 'Gato', age: 1, weight: 4, shelter: 'Gatitos Felices' },
      history: null,
    });

    renderWithRouter();

    expect(
      await screen.findByText('Esta mascota aún no tiene un historial médico registrado.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });
});
