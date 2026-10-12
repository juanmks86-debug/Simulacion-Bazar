import { useSim } from '../hooks/useSim'
import { useStore } from '../hooks/useStore'
import { controller } from '../sim/controller'
import { toggleCollapsed, uiStore } from '../sim/uiStore'

export default function Header() {
  const { icon, clock, period, promoText } = useSim((s) => s)
  const collapsed = useStore(uiStore, (s) => s.collapsed)
  return (
    <div className="card header-card" id="inicio">
      <div className="brandline">
        <div className="brandmark">🏺</div>
        <div>
          <div className="eyebrow">Tecnicatura Superior en Big Data e IA · IES N.º 6 (Versión Revisada con Devolución Docente)</div>
          <h1>Plataforma de Minería de Datos: Bazar Inteligente</h1>
          <div className="sub" style={{ marginTop: 4 }}>
            Caso de estudio: <b>Pack Mesa Completa</b> (Apriori + Monte Carlo + Validación Bootstrap) ·{' '}
            <span id="ico">{icon}</span> <b id="clk">{clock}</b> · <span id="per">{period}</span> · Promoción:{' '}
            <b id="prm" style={{ color: 'var(--gold)' }}>{promoText}</b>
          </div>
        </div>
      </div>
      <div className="toolbar">
        <button className="btn btn-gold" id="toggleZenBtn" onClick={toggleCollapsed}>{collapsed ? '▶ Mostrar Menú' : '◀ Expandir Canvas'}</button>
        <button className="btn btn-primary" id="go" onClick={() => controller.setRunning(true)}>▶ Iniciar</button>
        <button className="btn" id="pa" onClick={() => controller.setRunning(false)}>⏸ Pausar</button>
        <button className="btn" id="re" onClick={() => controller.reset()}>↻ Reiniciar</button>
        <button className="btn" id="full" onClick={() => controller.toggleFullscreen()}>⛶ Pantalla Completa</button>
        <button className="btn btn-gold" id="csv" onClick={() => controller.exportCsv()}>⇩ Exportar CSV</button>
      </div>
    </div>
  )
}
