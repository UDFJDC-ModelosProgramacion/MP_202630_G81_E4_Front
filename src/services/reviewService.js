import { api } from './apiClient'
import { CURRENT_USER } from '../config/currentUser'

// GET devuelve ReviewDetailDTO (pet y adopter anidados)
const toReview = (dto) => ({
  id: dto.id,
  adopterName: dto.adopter?.name ?? 'Adoptante',
  rating: dto.rating,
  comment: dto.comment,
  date: dto.date,
})

export const getReviews = async (petId) => {
  const data = await api.get(`/pets/${petId}/reviews`)
  return data.map(toReview)
}

// El create recibe el DetailDTO: pet y adopter van como objetos con id
export const createReview = async (petId, { rating, comment }) => {
  const dto = await api.post('/reviews', {
    rating,
    comment,
    date: new Date().toISOString(),
    pet: { id: Number(petId) },
    adopter: { id: CURRENT_USER.adopterId },
  })
  // POST devuelve el DTO básico (sin adopter): el nombre sale de CURRENT_USER
  return {
    id: dto.id,
    adopterName: CURRENT_USER.name,
    rating: dto.rating,
    comment: dto.comment,
    date: dto.date,
  }
}

export const getPet = async (petId) => {
  const dto = await api.get(`/pets/${petId}`)
  return {
    id: dto.id,
    name: dto.name,
    breed: dto.breed,
    age: dto.age,
    sex: dto.sex,
    size: dto.size,
    status: dto.adoptionStatus,
  }
}