import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/bazar.css'

// Sin <StrictMode> a propósito: el motor de simulación se inicia una sola vez al montar el panel.
// HashRouter: las rutas funcionan en cualquier hosting estático sin configurar el servidor (#/montecarlo).
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <App />
  </HashRouter>
)
