import { useDynamicCatalog } from '../hooks/useDynamicCatalog'
import { setProductEconomics } from '../sim/dynamicCatalog'
import { money } from '../sim/calculator'

export default function CatalogRows() {
  const { products, data } = useDynamicCatalog()
  if (!data.sales.length) return <tr><td colSpan={8} className="sub">Cargá un CSV en «Datos reales» para construir automáticamente el catálogo.</td></tr>
  return <>
    {products.map((p, index) => {
      const margin = p.p > 0 ? (p.p - p.costo) / p.p * 100 : 0
      return <tr key={p.id}>
        <td>{p.e} <b>{index + 1}</b></td>
        <td>{p.n}</td>
        <td><span className={`tag-rot ${p.rot === 'Alta' ? 'tag-high' : 'tag-low'}`}>{p.rot}</span><div className="sub">{p.tickets} tickets · {p.units} unidades</div></td>
        <td style={{ color: '#fff', fontWeight: 'bold' }}>{p.sourcePrice === 'csv' ? money(p.p) : 'Sin precio válido'}</td>
        <td><input aria-label={`Costo de ${p.n}`} type="number" min="0" step="0.01" value={Number(p.costo.toFixed(2))} disabled={p.p <= 0} onChange={(e) => {
          const cost = Math.max(0, Number(e.target.value) || 0)
          setProductEconomics(p.n, { cost, margin: p.p > 0 ? (p.p - cost) / p.p : 0 })
        }} style={{ width: 110, maxWidth: '100%' }} /></td>
        <td><input aria-label={`Margen de ${p.n}`} type="number" min="0" max="100" step="1" value={Number(margin.toFixed(1))} disabled={p.p <= 0} onChange={(e) => {
          const nextMargin = Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100
          setProductEconomics(p.n, { cost: p.p * (1 - nextMargin), margin: nextMargin })
        }} style={{ width: 76, maxWidth: '100%' }} />%</td>
        <td style={{ fontSize: 11, color: 'var(--gold)' }}>{p.rol}</td>
        <td>{p.sourcePrice === 'csv' ? 'CSV' : 'Revisar precio'}</td>
      </tr>
    })}
  </>
}
