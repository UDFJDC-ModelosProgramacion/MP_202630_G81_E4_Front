import { api } from './apiClient'

export const getAdoptionRequests = () => api.get('/adoption-requests')

export const updateAdoptionRequest = (id, request) =>
  api.put(`/adoption-requests/${id}`, request)