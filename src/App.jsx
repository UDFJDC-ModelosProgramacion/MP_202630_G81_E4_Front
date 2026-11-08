import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AdoptionRequestPage from './pages/AdoptionRequestPage/AdoptionRequestPage'
import NotificationsPage from './pages/Notifications/NotificationsPage'
import MessagesPage from './pages/MessagesPage/MessagesPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import AdoptionRequestsPage from './features/adoption-requests/AdoptionRequestsPage'
import AdoptionsPage from './features/adoptions/AdoptionsPage'
import TrialRequestPage from './features/trial-requests/TrialRequestPage'
import PetReviewsPage from './pages/PetReviews/PetReviewsPage'
import ShelterManager from './components/Shelter/ShelterManager'
import FollowUpForm from './components/FollowUp/FollowUpForm'
import FollowUpList from './components/FollowUp/FollowUpList'
import FollowUpDetail from './components/FollowUp/FollowUpDetail'
import VeterinariansPage from './pages/Veterinarians/VeterinariansPage'

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
        <Route path="/pets/:petId/reviews" element={<PetReviewsPage />} />
        <Route path="/adoptions" element={<AdoptionsPage />} />
        <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
        <Route path="/shelters" element={<ShelterManager />} />
        <Route path="/shelters/:shelterId/veterinarians" element={<VeterinariansPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/adoptions/new" element={<AdoptionRequestPage />} />

        
        <Route
          path="/trial-requests/new"
          element={<TrialRequestPage />}
        />


        <Route path="/follow-ups/new" element={<FollowUpForm />} />
        <Route path="/follow-ups/:id/edit" element={<FollowUpForm />} />
        {/* HU08 - Consultar seguimientos veterinarios (Juan David Parrado) */}
        <Route path="/follow-ups" element={<FollowUpList />} />
        <Route path="/follow-ups/:id" element={<FollowUpDetail />} />
      </Route>
    </Routes>
  )
}
