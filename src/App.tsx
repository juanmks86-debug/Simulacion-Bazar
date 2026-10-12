import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Kpis from './components/Kpis'
import Callout from './sections/Callout'
import Bootstrap from './sections/Bootstrap'
import Calculator from './sections/Calculator'
import RulesApriori from './sections/RulesApriori'
import AprioriVsFp from './sections/AprioriVsFp'
import Sensitivity from './sections/Sensitivity'
import Pilot from './sections/Pilot'
import Crisp from './sections/Crisp'
import Catalog from './sections/Catalog'
import Sales from './sections/Sales'
import Scenarios from './sections/Scenarios'
import Academic from './sections/Academic'
import Events from './sections/Events'

// Monte Carlo trae la librería de gráficos (Recharts): se descarga solo cuando se abre esa ruta
const MonteCarlo = lazy(() => import('./sections/MonteCarlo'))

// Qué muestra cada ruta. La simulación 3D y los controles viven en <Layout/> (siempre montados) y se muestran según la ruta.
const PAGES: Record<string, ReactNode> = {
  '/': <><Callout /><Kpis /></>,
  '/simulacion': <Kpis />,
  '/parametros': <Kpis />,
  '/indicadores': <Kpis />,
  '/montecarlo': <Suspense fallback={<div className="card sub">Cargando gráfico…</div>}><MonteCarlo /></Suspense>,
  '/bootstrap': <Bootstrap />,
  '/calculadora': <Calculator />,
  '/reglas': <RulesApriori />,
  '/apriori-fp': <AprioriVsFp />,
  '/sensibilidad': <Sensitivity />,
  '/piloto': <Pilot />,
  '/crisp': <Crisp />,
  '/productos': <Catalog />,
  '/ventas': <Sales />,
  '/escenarios': <Scenarios />,
  '/academico': <Academic />,
  '/eventos': <Events />,
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {Object.entries(PAGES).map(([path, element]) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
