import { PROD } from '../sim/catalog.js'

const money = (n) => '$ ' + Math.round(n).toLocaleString('es-AR')

// Filas de la tabla "Catálogo & Precios Reales" (datos estáticos del catálogo)
export default function CatalogRows() {
  return PROD.map((p) => {
    const alta = p.rot === 'Alta'
    return (
      <tr key={p.id}>
        <td>{p.e} <b>{p.id}</b></td>
        <td>{p.n}</td>
        <td><span className={`tag-rot ${alta ? 'tag-high' : 'tag-low'}`}>{p.rot}</span></td>
        <td style={{ color: '#fff', fontWeight: 'bold' }}>{money(p.p)}</td>
        <td style={{ color: 'var(--mu)' }}>{money(p.costo)}</td>
        <td>{alta ? '40%' : '60%'}</td>
        <td style={{ fontSize: 11, color: 'var(--gold)' }}>{p.rol}</td>
      </tr>
    )
  })
}
