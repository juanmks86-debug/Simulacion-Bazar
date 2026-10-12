import { useSim } from '../hooks/useSim'
import { PROD } from '../sim/catalog'

// Unidades vendidas por producto (barras)
export default function Sales() {
  const units = useSim((s) => s.units)
  const vals = PROD.map((p) => units[p.id] || 0)
  const max = Math.max(1, ...vals)
  return (
    <div className="card" id="ventas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>▥ Ventas Acumuladas por Producto</h2>
        <span className="sub">Unidades vendidas en la simulación activa</span>
      </div>
      <div className="chart-bars" id="productChart">
        {PROD.map((p, i) => (
          <div className="barcol" key={p.id}>
            <div className="barval">{vals[i]}</div>
            <div className="bar" style={{ height: `${Math.max(3, (vals[i] / max) * 100)}%` }} title={`${p.n}: ${vals[i]} u.`} />
            <div className="barlabel">{p.e}<br />{p.n.split(' ')[0]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
