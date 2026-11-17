import { useSim } from '../hooks/useSim'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'
import { PROD } from '../sim/catalog'

// Unidades vendidas por producto (barras)
export default function Sales() {
  const units = useSim((s) => s.units)
  const { products, data } = useDynamicCatalog()
  const catalog = data.sales.length ? products : PROD
  const vals = catalog.map((p) => data.sales.length ? (p.units ?? 0) : units[p.id] || 0)
  const max = Math.max(1, ...vals)
  return (
    <div className="card" id="ventas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>▥ Ventas Acumuladas por Producto</h2>
        <span className="sub">{data.sales.length ? 'Unidades del CSV cargado' : 'Unidades vendidas en la simulación activa'}</span>
      </div>
      <div className="chart-bars" id="productChart">
        {catalog.map((p, i) => (
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
