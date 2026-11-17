import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { toggleCollapsed, uiStore } from '../sim/uiStore'

type MenuItem = { path: string; icon: string; label: string; badge?: string }
type MenuGroup = { id: string; icon: string; label: string; items: MenuItem[] }

const GROUPS: MenuGroup[] = [
  {
    id: 'gestion', icon: '📦', label: 'Gestión', items: [
      { path: '/productos', icon: '▤', label: 'Productos e inventario' },
      { path: '/ventas', icon: '▥', label: 'Clientes y ventas' },
      { path: '/parametros', icon: '⚙', label: 'Parámetros del negocio' },
      { path: '/indicadores', icon: '◫', label: 'Indicadores' },
    ],
  },
  {
    id: 'comercial', icon: '🏷️', label: 'Comercial', items: [
      { path: '/decisiones', icon: '🎯', label: 'Combos y promociones', badge: 'F4' },
      { path: '/calculadora', icon: '🧮', label: 'Calculadora de margen' },
      { path: '/escenarios', icon: '⇄', label: 'Escenarios comerciales' },
    ],
  },
  {
    id: 'inteligencia', icon: '🧠', label: 'Inteligencia', items: [
      { path: '/reglas', icon: '⌘', label: 'Reglas Apriori' },
      { path: '/apriori-fp', icon: '⚖', label: 'Apriori vs. FP-Growth' },
      { path: '/bootstrap', icon: '🧪', label: 'Validación Bootstrap' },
      { path: '/montecarlo', icon: '🎲', label: 'Monte Carlo' },
      { path: '/sensibilidad', icon: '◈', label: 'Análisis de sensibilidad' },
      { path: '/piloto', icon: '🚀', label: 'Prueba piloto' },
      { path: '/crisp', icon: '🔄', label: 'Metodología CRISP-DM' },
    ],
  },
  {
    id: 'configuracion', icon: '⚙️', label: 'Configuración', items: [
      { path: '/datos', icon: '📁', label: 'Importar datos (CSV)' },
      { path: '/eventos', icon: '☷', label: 'Registro de eventos' },
      { path: '/academico', icon: '🎓', label: 'Ficha académica' },
      { path: '/informe', icon: '🖨', label: 'Informe PDF' },
    ],
  },
]

export default function Sidebar() {
  const { collapsed, menuOpen } = useStore(uiStore, (s) => s)
  const { pathname } = useLocation()
  const activeGroup = GROUPS.find((group) => group.items.some((item) => item.path === pathname))?.id
  const [expandedGroup, setExpandedGroup] = useState<string | null>(activeGroup ?? null)

  useEffect(() => {
    if (activeGroup) setExpandedGroup(activeGroup)
  }, [activeGroup])

  const closeMenu = () => uiStore.publish({ menuOpen: false })
  const onToggle = () => {
    if (collapsed) {
      const isMobile = window.matchMedia('(max-width: 1050px)').matches
      uiStore.publish({ collapsed: false, menuOpen: isMobile })
      return
    }
    uiStore.publish({ menuOpen: !menuOpen })
  }

  return (
    <>
      <button className="menu-toggle" id="menuToggle" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={onToggle}>
        {menuOpen ? '✕' : '☰'}
      </button>

      <aside className={`side-menu${menuOpen ? ' open' : ''}`} id="sideMenu" aria-label="Navegación principal">
        <div className="side-brand">
          <div className="side-logo" aria-hidden="true">🛍️</div>
          <div className="side-brand-copy">
            <strong>BAZAR SIMULATOR</strong>
            <span><i className="status-dot" /> Sistema inteligente</span>
          </div>
        </div>

        <div className="side-caption">ESPACIO DE TRABAJO</div>
        <nav className="side-nav">
          <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => `side-link side-link-home${isActive ? ' active' : ''}`}>
            <span className="side-link-icon">⌂</span>
            <span className="side-link-copy"><b>Inicio</b><small>Centro de operaciones</small></span>
          </NavLink>
          <NavLink to="/simulacion" onClick={closeMenu} className={({ isActive }) => `side-link side-link-home${isActive ? ' active' : ''}`}>
            <span className="side-link-icon">▦</span>
            <span className="side-link-copy"><b>Simulación</b><small>Bazar 3D</small></span>
            <span className="side-badge">3D</span>
          </NavLink>

          <div className="side-caption side-caption-spaced">GESTIÓN DEL NEGOCIO</div>
          {GROUPS.map((group) => {
            const isExpanded = expandedGroup === group.id
            const hasActiveItem = group.items.some((item) => item.path === pathname)
            return (
              <section className={`side-group${hasActiveItem ? ' has-active' : ''}`} key={group.id}>
                <button
                  type="button"
                  className={`side-group-trigger${hasActiveItem ? ' active' : ''}`}
                  aria-expanded={isExpanded}
                  aria-controls={`side-submenu-${group.id}`}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                >
                  <span className="side-link-icon">{group.icon}</span>
                  <b>{group.label}</b>
                  <span className={`side-chevron${isExpanded ? ' expanded' : ''}`}>⌄</span>
                </button>
                {isExpanded && (
                  <div className="side-submenu" id={`side-submenu-${group.id}`}>
                    {group.items.map((item) => (
                      <NavLink key={item.path} to={item.path} onClick={closeMenu} className={({ isActive }) => `side-sublink${isActive ? ' active' : ''}`}>
                        <span className="side-sub-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.badge && <span className="side-badge">{item.badge}</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </nav>

        <NavLink to="/decisiones" onClick={closeMenu} className="side-ai-card">
          <span className="side-ai-title">✨ Asistente inteligente</span>
          <span>Revisá oportunidades y recomendaciones comerciales.</span>
          <b>Ver recomendaciones →</b>
        </NavLink>

        <div className="side-footer">
          <span className="status-dot" /> <b>Simulación disponible</b>
          <small>Simulacion-Bazar · Fase 4</small>
        </div>

        <button className="side-collapse" id="collapseSideBtn" onClick={toggleCollapsed} aria-label={collapsed ? "Mostrar navegación" : "Contraer navegación"}>
          {collapsed ? '▶ Mostrar menú' : '◀ Contraer menú'}
        </button>
      </aside>

      <div className={`side-overlay${menuOpen ? ' open' : ''}`} id="sideOverlay" onClick={closeMenu} />
    </>
  )
}
