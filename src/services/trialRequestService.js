import { api } from './apiClient'

const toRef = (value) => (value?.id ? { id: value.id } : value)

// El PUT/POST reciben asociaciones solo con id, no el DetailDTO del GET.
const toTrialPayload = ({ adopter, pet, shelter, ...rest }) => ({
  ...rest,
  ...(adopter && { adopter: toRef(adopter) }),
  ...(pet && { pet: toRef(pet) }),
  ...(shelter && { shelter: toRef(shelter) }),
})

export const listTrialRequests = () => api.get('/trial-requests')

export const createTrialRequest = (trial) =>
  api.post('/trial-requests', toTrialPayload(trial))

export const updateTrialRequest = (id, trial) =>
  api.put(`/trial-requests/${id}`, toTrialPayload(trial))