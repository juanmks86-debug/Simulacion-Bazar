import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import RulesTable, { pctEs } from '../components/RulesTable'

export default function RulesApriori() {
  const [support, setSupport] = useState(2)
  const [confidence, setConfidence] = useState(20)
  const { data, analysis } = useAnalysis(support / 100, confidence / 100)
  const pack = analysis?.pack.pack
  const step = analysis?.pack.step
  return (
    <div className="card" id="reglas">
      <div className="eyebrow">Minería de datos · reglas de asociación</div>
      <h2>⌘ Reglas de asociación Apriori</h2>
      <p className="sub">Las métricas se calculan con los tickets del archivo activo. Soporte = frecuencia conjunta; confianza = probabilidad condicional; lift = relación respecto de la independencia.</p>
      <div className="btns-group" style={{ margin: '12px 0', flexWrap: 'wrap' }}>
        <label className="sub">Soporte mínimo: <b>{support}%</b><input aria-label="Soporte mínimo de reglas" type="range" min="1" max="20" value={support} onChange={(e) => setSupport(Number(e.target.value))} /></label>
        <label className="sub">Confianza mínima: <b>{confidence}%</b><input aria-label="Confianza mínima de reglas" type="range" min="5" max="100" step="5" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} /></label>
      </div>
      {!analysis && <p className="sub">No hay datos cargados. Abrí Datos reales (CSV) para cargar tus ventas o el dataset sintético de demostración.</p>}
      {analysis && <>
        <p className="sub">Fuente: <b>{data.fileName}</b> · {analysis.baskets.length} tickets {data.synthetic ? '· dataset sintético, no son ventas reales' : '· CSV cargado'}</p>
        <div className="eyebrow" style={{ marginTop: 14 }}>Regla de negocio de referencia · Pack Mesa Completa</div>
        <div className="ruleflow"><span className="chip">Platos</span><span className="chip">Tazas</span><span className="chip">Servilletero</span><span className="arrow">➜</span><span className="chip chip-target">🧺 Canasta</span></div>
        {analysis.pack.missing.length > 0 ? <p className="sub">No se pudo evaluar el pack: faltan productos compatibles con {analysis.pack.missing.join(', ')} en el CSV.</p> : <div className="metrics5">
          <div className="metricbox"><span>Soporte</span><strong>{pctEs(pack?.support ?? 0, 2)}</strong><small>{pack?.count ?? 0} tickets</small></div>
          <div className="metricbox"><span>Confianza</span><strong>{pack?.confidence == null ? '—' : pctEs(pack.confidence)}</strong><small>Canasta dado el antecedente</small></div>
          <div className="metricbox"><span>Lift</span><strong>{pack?.lift == null ? '—' : `${pack.lift.toFixed(2)}×`}</strong><small>Asociación relativa</small></div>
          <div className="metricbox"><span>Formación del combo</span><strong>{step?.confidence == null ? '—' : pctEs(step.confidence)}</strong><small>Platos → Tazas + Servilletero</small></div>
          <div className="metricbox"><span>Antecedentes</span><strong>{pack?.antecedentCount ?? 0}</strong><small>Tickets con los 3 productos</small></div>
        </div>}
        <h3 style={{ marginTop: 16 }}>Reglas descubiertas</h3>
        <RulesTable rules={analysis.rules} limit={30} />
        <p className="sub" style={{ marginTop: 8 }}>{analysis.itemsets.length} itemsets frecuentes · {analysis.rules.length} reglas que superan los umbrales. Un lift mayor que 1 indica asociación positiva, no causalidad.</p>
      </>}
    </div>
  )
}
