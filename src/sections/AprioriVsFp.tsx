import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { pctEs } from '../components/RulesTable'

export default function AprioriVsFp() {
  const [support, setSupport] = useState(2)
  const [confidence, setConfidence] = useState(20)
  const { data, analysis } = useAnalysis(support / 100, confidence / 100)
  const comparison = analysis?.comparison
  return (
    <div className="card" id="apriori-fp">
      <div className="eyebrow">Laboratorio de minería · comparación algorítmica</div>
      <h2>⚖ Apriori vs. FP-Growth: comparación con los mismos datos</h2>
      <p className="sub">Ambos algoritmos procesan las mismas canastas, el mismo soporte mínimo y el mismo tamaño máximo de conjunto. Las diferencias se calculan en el navegador.</p>
      <div className="btns-group" style={{ margin: '12px 0', flexWrap: 'wrap' }}>
        <label className="sub">Soporte mínimo: <b>{support}%</b><input aria-label="Soporte mínimo" type="range" min="1" max="20" value={support} onChange={(e) => setSupport(Number(e.target.value))} /></label>
        <label className="sub">Confianza mínima: <b>{confidence}%</b><input aria-label="Confianza mínima" type="range" min="5" max="100" step="5" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} /></label>
      </div>
      {!analysis && <div className="sub">No hay ventas cargadas. Ingresá a <b>Datos reales (CSV)</b> y cargá un archivo o el ejemplo sintético para ejecutar la comparación.</div>}
      {analysis && comparison && <>
        <div className="mc-stats">
          <div className="mc-kpi"><small>Tickets analizados</small><b>{analysis.baskets.length}</b></div>
          <div className="mc-kpi"><small>Itemsets Apriori</small><b>{comparison.apriori.length}</b></div>
          <div className="mc-kpi"><small>Itemsets FP-Growth</small><b>{comparison.fpGrowth.length}</b></div>
          <div className="mc-kpi"><small>Coincidencias</small><b>{comparison.matched}</b></div>
        </div>
        {data.synthetic && <p className="sub" style={{ color: 'var(--warning)' }}>Dataset sintético de demostración: los resultados no representan ventas reales.</p>}
        <table className="custom-table" style={{ marginTop: 12 }}>
          <thead><tr><th>Métrica</th><th>Apriori</th><th>FP-Growth</th></tr></thead>
          <tbody>
            <tr><td>Conjuntos frecuentes</td><td>{comparison.apriori.length}</td><td>{comparison.fpGrowth.length}</td></tr>
            <tr><td>Reglas generadas</td><td>{comparison.aprioriRules.length}</td><td>{comparison.fpRules.length}</td></tr>
            <tr><td>Conjuntos coincidentes</td><td colSpan={2}>{comparison.matched} de {comparison.apriori.length + comparison.onlyFp.length}</td></tr>
            <tr><td>Solo Apriori</td><td colSpan={2}>{comparison.onlyApriori.length ? comparison.onlyApriori.map((x) => x.join(' + ')).join(' · ') : 'Ninguno'}</td></tr>
            <tr><td>Solo FP-Growth</td><td colSpan={2}>{comparison.onlyFp.length ? comparison.onlyFp.map((x) => x.join(' + ')).join(' · ') : 'Ninguno'}</td></tr>
          </tbody>
        </table>
        <h3 style={{ marginTop: 16 }}>Reglas principales detectadas</h3>
        <table className="custom-table"><thead><tr><th>Antecedente</th><th>Consecuente</th><th>Soporte</th><th>Confianza</th><th>Lift</th></tr></thead>
          <tbody>{comparison.fpRules.slice(0, 12).map((r, i) => <tr key={`${r.antecedent.join()}-${r.consequent.join()}-${i}`}><td>{r.antecedent.join(' + ')}</td><td>{r.consequent.join(' + ')}</td><td>{pctEs(r.support)}</td><td>{pctEs(r.confidence)}</td><td>{r.lift.toFixed(2)}×</td></tr>)}</tbody>
        </table>
        <h3 style={{ marginTop: 16 }}>Combos comerciales sugeridos automáticamente</h3>
        <p className="sub">Se muestran asociaciones de tres o más productos que aparecen en itemsets frecuentes y tienen un consecuente individual.</p>
        <table className="custom-table"><thead><tr><th>Antecedentes</th><th>Producto sugerido</th><th>Soporte</th><th>Confianza</th><th>Lift</th></tr></thead>
          <tbody>{analysis.combos.slice(0, 10).map((r, i) => <tr key={`combo-${i}`}><td>{r.antecedent.join(' + ')}</td><td>{r.consequent.join(' + ')}</td><td>{pctEs(r.support)}</td><td>{pctEs(r.confidence)}</td><td>{r.lift.toFixed(2)}×</td></tr>)}
            {!analysis.combos.length && <tr><td colSpan={5}>No se encontraron combos con estos umbrales.</td></tr>}</tbody>
        </table>
        <p className="sub" style={{ marginTop: 8 }}>La comparación valida equivalencia de resultados para el mismo umbral. La velocidad no se presenta como una ventaja medida si no se ejecuta una prueba de rendimiento controlada.</p>
      </>}
    </div>
  )
}
