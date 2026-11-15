// There is no login yet, so the app always acts as this fixed user.
// When a real login exists, replace this constant with the logged-in user.
// userId    -> id in the "users" resource (used by messages, HU17)
// adopterId -> id in the "adopters" resource (used by the profile and requests, HU12 and HU02)
export const CURRENT_USER = {
  userId: 12,
  adopterId: 12,
  name: 'María Gómez',
}
