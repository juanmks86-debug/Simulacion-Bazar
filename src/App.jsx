import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import { ROUTES } from './routes.js'

// Layout persistente: menú lateral + panel. <Outlet/> recibe la ruta activa.
function Layout() {
  return (
    <>
      <Sidebar />
      <Dashboard />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={null} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
