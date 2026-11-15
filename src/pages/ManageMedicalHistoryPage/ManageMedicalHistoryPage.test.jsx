import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageMedicalHistoryPage from './ManageMedicalHistoryPage';
import {
  getMedicalHistory,
  saveMedicalHistory,
} from '../../services/manageMedicalHistoryService';

vi.mock('../../services/manageMedicalHistoryService', () => ({
  getMedicalHistory: vi.fn(),
  saveMedicalHistory: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ManageMedicalHistoryPage />
    </MemoryRouter>,
  );

describe('HU10 - Gestionar historial médico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Valida que no se puede desesterilizar una mascota', async () => {
    getMedicalHistory.mockResolvedValue({ history: { id: 5, isSterilized: true } });
    renderPage();

    await waitFor(() => screen.getByDisplayValue('Sí'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'No' } });
    fireEvent.click(screen.getByText('Guardar'));

    expect(
      await screen.findByText('Una mascota esterilizada no puede pasar a no esterilizada.'),
    ).toBeInTheDocument();
    expect(saveMedicalHistory).not.toHaveBeenCalled();
  });

  it('Valida que el tratamiento es obligatorio si hay enfermedad', async () => {
    getMedicalHistory.mockResolvedValue(null);
    renderPage();

    fireEvent.change(screen.getByLabelText('Enfermedad'), { target: { value: 'Gripe' } });
    fireEvent.click(screen.getByText('Guardar'));

    expect(
      await screen.findByText('Falta el tratamiento: es obligatorio al agregar una enfermedad nueva.'),
    ).toBeInTheDocument();
    expect(saveMedicalHistory).not.toHaveBeenCalled();
  });

  it('Guarda el historial y muestra el mensaje de éxito', async () => {
    getMedicalHistory.mockResolvedValue(null);
    saveMedicalHistory.mockResolvedValue({ id: 1 });
    renderPage();

    fireEvent.change(screen.getByLabelText('Enfermedad'), { target: { value: 'Gripe' } });
    fireEvent.change(screen.getByLabelText(/Tratamiento/), { target: { value: 'Reposo' } });
    fireEvent.click(screen.getByText('Guardar'));

    expect(await screen.findByText('Historial guardado exitosamente.')).toBeInTheDocument();
    expect(saveMedicalHistory).toHaveBeenCalled();
  });

  it('Al actualizar conserva la vacuna existente y usa el id del historial', async () => {
    getMedicalHistory.mockResolvedValue({
      history: {
        id: 7,
        isSterilized: true,
        diseases: 'Gastroenteritis',
        treatment: 'Antibióticos',
        vaccine: 'Rabia, Parvovirus',
      },
    });
    saveMedicalHistory.mockResolvedValue({ id: 7 });
    renderPage();

    await waitFor(() => screen.getByDisplayValue('Sí'));
    fireEvent.change(screen.getByLabelText(/Tratamiento/), { target: { value: 'Tratamiento finalizado' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => expect(saveMedicalHistory).toHaveBeenCalled());
    const [, data, historyId] = saveMedicalHistory.mock.calls[0];
    expect(historyId).toBe(7);
    expect(data.vaccine).toBe('Rabia, Parvovirus');
  });

  it('Muestra el error del backend al guardar', async () => {
    getMedicalHistory.mockResolvedValue(null);
    saveMedicalHistory.mockRejectedValue(new Error('La operación no está permitida.'));
    renderPage();

    fireEvent.click(screen.getByText('Guardar'));

    expect(await screen.findByText('La operación no está permitida.')).toBeInTheDocument();
  });
});
