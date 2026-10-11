import { NavLink } from 'react-router-dom'
import { ROUTES } from '../routes.js'

// Los ids (sideMenu, menuToggle, collapseSideBtn, sideOverlay) los usa el motor para el modo ampliado y el menú móvil.
export default function Sidebar() {
  return (
    <>
      <button className="menu-toggle" id="menuToggle" aria-label="Abrir menú" aria-expanded="false">☰</button>

      <aside className="side-menu" id="sideMenu" aria-label="Navegación principal">
        <div className="side-brand">
          <div className="side-logo">🏺</div>
          <div>
            <strong>Bazar Inteligente</strong>
            <span>IES N.º 6 · Big Data e IA</span>
          </div>
        </div>

        <button
          className="mini-btn"
          id="collapseSideBtn"
          style={{ width: '100%', justifyContent: 'center', margin: '4px 0 2px', background: '#18281d', borderColor: '#38523b' }}
        >
          ◀ Ocultar Menú (Modo Ampliado)
        </button>

        <div className="side-caption">MENÚ ANALÍTICO</div>
        <nav className="side-nav">
          {ROUTES.map((r) => (
            <NavLink
              key={r.path}
              to={r.path}
              end={r.path === '/'}
              className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}
            >
              <span>{r.icon}</span> {r.label}
              {r.badge && <span className="side-badge">{r.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="side-footer">
          <div><span className="status-dot"></span> <b>Dataset:</b> 601 regs · 188 tickets</div>
          <div style={{ fontSize: 10, marginTop: 3 }}>Precios Reales: Perico, Jujuy (Ago 2026)</div>
        </div>
      </aside>

      <div className="side-overlay" id="sideOverlay"></div>
    </>
  )
}
