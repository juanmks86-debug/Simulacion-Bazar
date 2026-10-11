import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './legacy/bazar.css'

// Nota: sin <StrictMode> a propósito. El motor de simulación se inicializa una sola vez
// y StrictMode (en desarrollo) montaría/desmontaría el componente dos veces.
ReactDOM.createRoot(document.getElementById('root')).render(
  // HashRouter: las rutas funcionan en cualquier hosting estático sin configurar el servidor (#/montecarlo)
  <HashRouter>
    <App />
  </HashRouter>
)
