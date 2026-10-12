// Una entrada por sección del menú lateral.
export interface RouteMeta { path: string; icon: string; label: string; badge?: string }

export const ROUTES: RouteMeta[] = [
  { path: '/',             icon: '⌂',  label: 'Inicio' },
  { path: '/simulacion',   icon: '▦',  label: 'Simulación 3D', badge: 'HD' },
  { path: '/parametros',   icon: '⚙',  label: 'Parámetros' },
  { path: '/indicadores',  icon: '◫',  label: 'Indicadores (KPIs)' },
  { path: '/montecarlo',   icon: '🎲', label: 'Simulación Monte Carlo' },
  { path: '/bootstrap',    icon: '🧪', label: 'Estabilidad Bootstrap' },
  { path: '/calculadora',  icon: '🧮', label: 'Calculadora de Margen' },
  { path: '/reglas',       icon: '⌘',  label: 'Reglas Apriori' },
  { path: '/apriori-fp',   icon: '⚖',  label: 'Apriori vs. FP-Growth' },
  { path: '/sensibilidad', icon: '⚖',  label: 'Test de Sensibilidad' },
  { path: '/piloto',       icon: '🚀', label: 'Plan de Prueba Piloto' },
  { path: '/crisp',        icon: '🔄', label: 'Metodología CRISP-DM' },
  { path: '/productos',    icon: '▤',  label: 'Catálogo & Precios Reales' },
  { path: '/ventas',       icon: '▥',  label: 'Ventas por Producto' },
  { path: '/escenarios',   icon: '⇄',  label: 'Comparador Escenarios' },
  { path: '/academico',    icon: '🎓', label: 'Ficha Académica & Autor' },
  { path: '/eventos',      icon: '☷',  label: 'Registro de Eventos' },
]
