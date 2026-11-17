import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { pctEs } from '../components/RulesTable'

export default function Sensitivity() {
  const [confidence, setConfidence] = useState(20)
  const { data, analysis } = useAnalysis(0.02, confidence / 100)
  return (
    <div className="card" id="sensibilidad">
      <div className="eyebrow">Laboratorio de minería · evaluación de umbrales</div>
      <h2>⚖ Análisis dinámico de sensibilidad</h2>
      <p className="sub">Se recalculan itemsets y reglas sobre el dataset activo. El soporte modifica el mínimo de tickets necesario para considerar frecuente una combinación.</p>
      <label className="sub">Confianza mínima: <b>{confidence}%</b><input aria-label="Confianza para sensibilidad" type="range" min="5" max="100" step="5" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} /></label>
      {!analysis && <p className="sub" style={{ marginTop: 12 }}>No hay datos para analizar. Cargá un CSV desde la sección Datos reales.</p>}
      {analysis && <>
        {data.synthetic && <p className="sub" style={{ color: 'var(--warning)' }}>Datos sintéticos de ejemplo; no son ventas reales.</p>}
        <div className="mc-stats"><div className="mc-kpi"><small>Tickets</small><b>{analysis.baskets.length}</b></div><div className="mc-kpi"><small>Confianza mínima</small><b>{confidence}%</b></div></div>
        <table className="custom-table" style={{ marginTop: 12 }}><thead><tr><th>Soporte mínimo</th><th>Tickets mínimos</th><th>Itemsets</th><th>Reglas</th><th>Combos de 3+</th></tr></thead>
          <tbody>{analysis.sensitivity.map((r) => <tr key={r.threshold} style={r.threshold === 0.02 ? { background: 'var(--card-alt)' } : undefined}><td>{pctEs(r.threshold, 1)}</td><td>{r.minCount}</td><td>{r.itemsets}</td><td>{r.rules}</td><td>{r.combos}</td></tr>)}</tbody>
        </table>
        <p className="sub" style={{ marginTop: 8 }}>La tabla se calcula para cada umbral sobre la misma muestra; no presupone que un umbral sea universalmente correcto. Elegilo considerando tamaño de muestra, utilidad comercial y estabilidad.</p>
      </>}
    </div>
  )
}
