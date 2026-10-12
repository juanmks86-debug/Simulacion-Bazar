import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../routes'
import { useStore } from '../hooks/useStore'
import { useShortcuts } from '../hooks/useShortcuts'
import { uiStore } from '../sim/uiStore'
import { initBazar } from '../sim/engine'
import Sidebar from './Sidebar'
import Header from './Header'
import SimulationArea from './SimulationArea'

export default function Layout() {
  const { pathname } = useLocation()
  const route = ROUTES.find((r) => r.path === pathname) ?? ROUTES[0]
  const collapsed = useStore(uiStore, (s) => s.collapsed)
  useShortcuts()

  // El motor arranca una sola vez, cuando el canvas ya está en el DOM
  useEffect(() => initBazar(), [])

  useEffect(() => { document.body.classList.toggle('sidebar-collapsed', collapsed) }, [collapsed])
  useEffect(() => { document.title = `${route.label} · Bazar Inteligente`; window.scrollTo({ top: 0 }) }, [route])

  return (
    <>
      <Sidebar />
      <div className="wrap">
        <Header />
        <Outlet />
        <SimulationArea showCanvas={route.path === '/simulacion'} showPanel={route.path === '/simulacion' || route.path === '/parametros'} />
      </div>
    </>
  )
}
