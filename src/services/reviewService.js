import { CURRENT_USER } from '../config/currentUser'
// Sample data. When the back is connected, replace each function body
// with a fetch to /api/... and keep the same signatures.
const pets = {
  1: {
    id: 1,
    name: 'Luna',
    breed: 'Labrador',
    age: '2 años',
    sex: 'Hembra',
    size: 'Mediano',
    status: 'Disponible para adopción',
  },
}

const reviewsByPet = {
  1: [
    { id: 1, adopterName: 'María P.', rating: 5, comment: 'Muy cariñosa y tranquila. Se adaptó rápido a casa.' },
    { id: 2, adopterName: 'Julián R.', rating: 4, comment: 'Buena con los niños, solo necesita paseos largos.' },
    { id: 3, adopterName: 'Sofía M.', rating: 5, comment: 'La mejor decisión. Totalmente recomendada.' },
  ],
}

let nextId = 4

const respond = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 300))

const fail = (message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 300))

export function getPet(petId) {
  const pet = pets[petId]
  return pet ? respond(pet) : fail('Mascota no encontrada')
}

export function getReviews(petId) {
  return respond([...(reviewsByPet[petId] ?? [])])
}

export function createReview(petId, { rating, comment }) {
  if (!pets[petId]) {
    return fail('Mascota no encontrada')
  }
    const review = {
    id: nextId++,
    adopterId: CURRENT_USER.adopterId,
    adopterName: CURRENT_USER.name,
    rating,
    comment: comment.trim(),
    date: new Date().toISOString(),
  }
  reviewsByPet[petId] = [review, ...(reviewsByPet[petId] ?? [])]
  return respond(review)
}