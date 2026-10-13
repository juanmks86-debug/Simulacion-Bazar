import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { histogram, monteCarlo, sensitivityRows } from '../sim/stats'
import { money } from '../sim/calculator'

// Evaluación financiera Monte Carlo (10.000 escenarios). El gráfico es responsivo (Recharts).
export default function MonteCarlo() {
  const [r, setR] = useState(() => monteCarlo())
  const rows = useMemo(() => sensitivityRows(r), [r])
  const pct = (n: number) => n.toFixed(1).replace('.', ',') + '%'
  const bins = histogram(r.histDiff, 50)
  const data = bins.map((b) => ({ mid: b.mid, count: b.count, label: money(b.mid) }))
  const nearest = (v: number) => data.reduce((best, d) => (Math.abs(d.mid - v) < Math.abs(best.mid - v) ? d : best), data[0])
  const meanBin = data.length ? nearest(r.diffMean) : null
  const zeroBin = data.length && data[0].mid <= 0 && data[data.length - 1].mid >= 0 ? nearest(0) : null

  return (
    <div className="card card-highlight" id="montecarlo">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="eyebrow">Técnica Complementaria · Sección 10.2 &amp; 14.2</div>
          <h2>🎲 Evaluación Financiera Monte Carlo (10.000 Escenarios)</h2>
          <div className="sub">Distinguiendo descubrimiento (Apriori) de evaluación bajo incertidumbre económica (Monte Carlo).</div>
        </div>
        <button className="btn btn-gold no-print" id="btnRunMC" onClick={() => setR(monteCarlo())}>▶ Re-ejecutar 10.000 Escenarios</button>
      </div>
      <div className="mc-stats">
        <div className="mc-kpi"><small>Media Canasta Sola (A)</small><b id="mcMeanA">{money(r.meanA)}</b></div>
        <div className="mc-kpi"><small>Media Combo Activo (B)</small><b id="mcMeanB" style={{ color: '#79e29a' }}>{money(r.meanB)}</b></div>
        <div className="mc-kpi"><small>Beneficio Neto a Favor</small><b id="mcDiff" style={{ color: 'var(--gold)' }}>+{money(r.diffMean)}</b></div>
        <div className="mc-kpi"><small>Prob. Favorable (Multiplicador 3x-6x)</small><b id="mcWin" style={{ color: '#60c572' }}>{r.winRate.toFixed(1)}%</b></div>
      </div>
      <div role="img" aria-label="Histograma comparativo Monte Carlo" style={{ width: '100%', height: 220, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }} barCategoryGap={1}>
            <CartesianGrid stroke="#233628" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#a6b7a8', fontSize: 10 }} interval={9} />
            <YAxis tick={{ fill: '#a6b7a8', fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ background: '#15221a', border: '1px solid #2b3f30', color: '#f5f3eb' }} formatter={(v) => [v, 'Escenarios']} labelFormatter={(l) => `Diferencia ≈ ${l}`} />
            <Bar dataKey="count" isAnimationActive={false}>
              {data.map((d) => (<Cell key={d.mid} fill={d.mid >= 0 ? '#3ea05d' : '#cf483d'} />))}
            </Bar>
            {zeroBin && <ReferenceLine x={zeroBin.label} stroke="#cf483d" strokeWidth={2} label={{ value: 'Equilibrio ($0)', fill: '#cf483d', fontSize: 10, position: 'insideTopRight' }} />}
            {meanBin && <ReferenceLine x={meanBin.label} stroke="#d8b675" strokeWidth={2.5} strokeDasharray="4 4" label={{ value: `Media: +${money(r.diffMean)}`, fill: '#d8b675', fontSize: 11, position: 'top' }} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 14 }}>
        <h3 style={{ color: '#fff', fontSize: 12, marginBottom: 6 }}>
          📊 Sensibilidad a los Supuestos del Modelo (Sección 14.2.2):
        </h3>
        <table className="custom-table" id="mcSensitivity">
          <thead>
            <tr>
              <th>Multiplicador de Demanda</th>
              <th>Nivel de Promoción</th>
              <th>Margen Mensual Promedio</th>
              <th>% Escenarios Favorables</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.range} style={row.isBase ? { background: '#192c1f' } : undefined} data-base={row.isBase ? 'true' : undefined}>
                <td>{row.isBase ? <b>{row.range}</b> : row.range}</td>
                <td>{row.isBase ? <b>{row.level}</b> : row.level}</td>
                <td>{row.isBase ? <b>{money(row.meanB)}</b> : money(row.meanB)}</td>
                <td><b style={row.isBase ? { color: 'var(--gold)' } : undefined}>{pct(row.winRate)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sub" style={{ marginTop: 6, fontSize: 11 }}>
          Calculado con el mismo modelo de arriba: la fila “Caso Base” coincide con los indicadores. Los valores cambian levemente en cada ejecución.
        </div>
      </div>
    </div>
  )
}
