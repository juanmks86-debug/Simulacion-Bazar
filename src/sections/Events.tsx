import { useSim } from '../hooks/useSim'
import { controller } from '../sim/controller'

export default function Events() {
  const log = useSim((s) => s.log)
  return (
    <div className="card" id="eventos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2>☷ Registro de Eventos en Tiempo Real</h2>
        <button className="mini-btn" id="clearLog" onClick={() => controller.clearLog()}>Limpiar Historial</button>
      </div>
      <div className="lg" id="lg">
        {log.map((l, i) => (
          <div key={`${l.t}-${i}`}><span>{l.t}</span><span>{l.m}</span><span>{l.v}</span></div>
        ))}
      </div>
    </div>
  )
}
