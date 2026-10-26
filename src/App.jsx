import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ShelterManager from './components/Shelter/ShelterManager'

function Pending({ title }) {
  return <h1>{title} (pendiente)</h1>
}

// HU13 - Gestionar refugios (Juan David Parrado Hernández)
// Reemplaza el <Pending> de la ruta /shelters.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Pending title="Inicio" />} />
        <Route path="/pets" element={<Pending title="Mascotas" />} />
        <Route path="/adoptions" element={<Pending title="Adopciones" />} />
        <Route path="/shelters" element={<ShelterManager />} />
        <Route path="/notifications" element={<Pending title="Notificaciones" />} />
      </Route>
    </Routes>
  )
}
