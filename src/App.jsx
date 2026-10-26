import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AdoptionRequestPage from './pages/AdoptionRequestPage/AdoptionRequestPage'
import MessagesPage from './pages/MessagesPage/MessagesPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import AdoptionRequestsPage from './features/adoption-requests/AdoptionRequestsPage';

function Pending({ title }) {
  return <h1>{title} (pendiente)</h1>
}

// Each user story replaces the <Pending> of its own route (one line per story).
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Pending title="Inicio" />} />
        <Route path="/pets" element={<Pending title="Mascotas" />} />
        <Route path="/adoptions" element={<Pending title="Adopciones" />} />
        <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
        <Route path="/shelters" element={<Pending title="Refugios" />} />
        <Route path="/notifications" element={<Pending title="Notificaciones" />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/adoptions/new" element={<AdoptionRequestPage />} />
      </Route>
    </Routes>
  )
}