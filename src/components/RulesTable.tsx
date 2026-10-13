import type { Rule } from '../sim/apriori'

export const pctEs = (x: number, d = 1) => (x * 100).toFixed(d).replace('.', ',') + '%'

/** Tabla de reglas de asociación (soporte, confianza y lift). */
export default function RulesTable({ rules, limit = 15 }: { rules: Rule[]; limit?: number }) {
  if (!rules.length) return <div className="sub">No hay reglas con esos umbrales. Probá bajar el soporte o la confianza mínima.</div>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="custom-table" id="dataRules">
        <thead>
          <tr><th>Si compra…</th><th>…también compra</th><th>Soporte</th><th>Confianza</th><th>Lift</th><th>Tickets</th></tr>
        </thead>
        <tbody>
          {rules.slice(0, limit).map((r, i) => (
            <tr key={i}>
              <td>{r.antecedent.join(' + ')}</td>
              <td><b>{r.consequent.join(' + ')}</b></td>
              <td>{pctEs(r.support, 2)}</td>
              <td>{pctEs(r.confidence)}</td>
              <td style={{ color: r.lift > 1 ? 'var(--gold)' : undefined }}>{r.lift.toFixed(2).replace('.', ',')}×</td>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
