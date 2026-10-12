import { useSim } from '../hooks/useSim'
import { controller } from '../sim/controller'
import { simStore, type CameraName } from '../sim/store'
import Controls from './Controls'
import ClientList from './ClientList'

const CAMS: { id: CameraName; dom: string; label: string }[] = [
  { id: 'general', dom: 'camGeneral', label: '🏢 General' },
  { id: 'combo', dom: 'camCombo', label: '🍽️ Pack Mesa' },
  { id: 'caja', dom: 'camCaja', label: '💳 Caja' },
]

// Canvas 3D + controles + clientes. Siempre montado (el motor sigue corriendo); se muestra según la ruta.
export default function SimulationArea({ showCanvas, showPanel }: { showCanvas: boolean; showPanel: boolean }) {
  const camera = useSim((s) => s.camera)
  const insp = useSim((s) => s.inspector)
  const visible = showCanvas || showPanel
  return (
    <div className={`grid-main${showCanvas && showPanel ? '' : ' single'}${visible ? '' : ' is-hidden'}`}>
      <div className={`card${showCanvas ? '' : ' is-hidden'}`} id="simulacion" style={{ padding: 8 }}>
        <div className="canvas-wrapper">
          <canvas id="cv" width={1240} height={830} role="img" aria-label="Simulación 3D isométrica de bazar con góndolas, clientes y caja" />
          <div className="canvas-floating-controls">
            <span style={{ fontSize: 11, color: 'var(--mu)', marginRight: 4, display: 'flex', alignItems: 'center' }}>🎥 Cámara:</span>
            {CAMS.map((c) => (
              <button key={c.id} id={c.dom} className={`cam-btn${camera === c.id ? ' active' : ''}`} onClick={() => controller.setCamera(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="canvas-info-badge">
            <span>✨ <b>Spotlight:</b> Góndola 1 &amp; 2 (Alta Rotación) ➔ Góndola 3 (Canasta)</span>{' '}
            <span id="spotlightAlert">🎯 Pack Mesa Completa listo</span>
          </div>
          <div className="shelf-inspector" id="shelfInspector" style={{ display: insp ? 'block' : 'none' }}>
            {insp && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong id="inspTitle" style={{ color: 'var(--gold)', fontSize: 13 }}>{insp.title}</strong>{' '}
                  <span className={`tag-rot ${insp.high ? 'tag-high' : 'tag-low'}`} id="inspBadge">{insp.badge}</span>
                </div>
                <div id="inspDetails" style={{ lineHeight: 1.6 }}>
                  <b>PVP Real:</b> {insp.pvp}<br />
                  <b>Costo Deducido:</b> {insp.costo}<br />
                  <b>Stock en Góndola:</b> {insp.stock} / {insp.cap} unidades<br />
                  <b>Rol Estratégico:</b> {insp.rol}
                </div>
              </>
            )}
            <button className="mini-btn" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} onClick={() => simStore.publish({ inspector: null })}>Cerrar</button>
          </div>
        </div>
      </div>
      <div className={showPanel ? '' : 'is-hidden'}>
        <Controls />
        <div className="card">
          <h2>Clientes en Tienda</h2>
          <ClientList />
        </div>
      </div>
    </div>
  )
}
