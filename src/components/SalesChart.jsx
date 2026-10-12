import { useSim } from '../hooks/useSim.js'
import { PROD } from '../sim/catalog.js'

// Unidades vendidas por producto (barras)
export default function SalesChart() {
  const units = useSim((s) => s.units)
  const vals = PROD.map((p) => units[p.id] || 0)
  const max = Math.max(1, ...vals)
  return PROD.map((p, i) => (
    <div className="barcol" key={p.id}>
      <div className="barval">{vals[i]}</div>
      <div className="bar" style={{ height: `${Math.max(3, (vals[i] / max) * 100)}%` }} title={`${p.n}: ${vals[i]} u.`} />
      <div className="barlabel">{p.e}<br />{p.n.split(' ')[0]}</div>
    </div>
  ))
}
