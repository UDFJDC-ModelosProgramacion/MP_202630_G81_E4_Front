import { api } from './apiClient'

export const createAdoption = (adoption) => api.post('/adoptions', adoption)