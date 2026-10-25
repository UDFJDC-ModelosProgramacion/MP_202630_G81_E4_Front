import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'

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
        <Route path="/shelters" element={<Pending title="Refugios" />} />
        <Route path="/notifications" element={<Pending title="Notificaciones" />} />
      </Route>
    </Routes>
  )
}