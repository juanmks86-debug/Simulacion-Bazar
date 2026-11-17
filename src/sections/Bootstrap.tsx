import { useMemo, useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { bootstrapRule } from '../sim/validation'
import { P } from '../sim/catalog'
import { evaluateRule } from '../sim/apriori'
import { norm } from '../sim/csv'
import type { BootstrapResult } from '../sim/validation'
import { pctEs } from '../components/RulesTable'

const mean = (v: number | null) => v === null ? '—' : v.toFixed(3).replace('.', ',')
const seededRandom = (seed: number) => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  return ((t ^ t >>> 14) >>> 0) / 4294967296
}

export default function Bootstrap() {
  const { data, analysis } = useAnalysis(0.02, 0.2)
  const [iterations, setIterations] = useState(500)
  const [minSupport, setMinSupport] = useState(2)
  const [result, setResult] = useState<BootstrapResult | null>(null)
  const [ruleKey, setRuleKey] = useState<string>('')

  // Canastas con los productos del catálogo normalizados a su id (platos, tazas...); el resto queda con su nombre original.
  const baskets = useMemo(() => {
    if (!analysis) return []
    const ids = new Map<string, string>()
    for (const [id, product] of Object.entries(P)) { ids.set(norm(id), id); ids.set(norm(product.n), id) }
    return analysis.baskets.map((basket) => basket.map((item) => ids.get(norm(item)) ?? item))
  }, [analysis])

  // Reglas disponibles: Pack Mesa (solo si el dataset tiene esos productos) + las 12 de mayor soporte del dataset cargado.
  const options = useMemo(() => {
    if (!analysis) return []
    const ids = new Map<string, string>()
    for (const [id, product] of Object.entries(P)) { ids.set(norm(id), id); ids.set(norm(product.n), id) }
    const toId = (item: string) => ids.get(norm(item)) ?? item
    const label = (item: string) => P[item]?.n ?? item
    const list: { key: string; label: string; antecedent: string[]; consequent: string[] }[] = []
    const pack = { antecedent: ['platos', 'tazas', 'servilletero'], consequent: ['canasta'] }
    if (evaluateRule(baskets, pack.antecedent, pack.consequent).antecedentCount > 0) {
      list.push({ key: 'pack', label: 'Pack Mesa: Platos + Tazas + Servilletero → Canasta', ...pack })
    }
    const seen = new Set(list.map((o) => o.key))
    for (const r of [...analysis.rules].sort((a, b) => b.support - a.support || b.lift - a.lift).slice(0, 12)) {
      const antecedent = r.antecedent.map(toId), consequent = r.consequent.map(toId)
      const key = antecedent.join('+') + '>' + consequent.join('+')
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ key, label: `${antecedent.map(label).join(' + ')} → ${consequent.map(label).join(' + ')} (lift ${r.lift.toFixed(2).replace('.', ',')})`, antecedent, consequent })
    }
    return list
  }, [analysis, baskets])

  const selected = options.find((o) => o.key === ruleKey) ?? options[0]
  const run = () => {
    if (!analysis || !selected) return
    setResult(bootstrapRule(baskets, selected.antecedent, selected.consequent, iterations, minSupport / 100, seededRandom(42)))
  }
  return (
    <div className="card" id="bootstrap">
      <div className="eyebrow">Validación estadística · remuestreo con reemplazo</div>
      <h2>🧪 Bootstrap: estabilidad de la regla seleccionada</h2>
      <p className="sub">Cada iteración genera una muestra del mismo tamaño que el dataset original, seleccionando tickets con reemplazo. Los indicadores se calculan al ejecutar el experimento.</p>
      {!analysis && <p className="sub">No hay ventas cargadas. Cargá un CSV o el ejemplo sintético en Datos reales para realizar el remuestreo.</p>}
      {analysis && !options.length && <p className="sub">Este dataset no tiene reglas con soporte ≥ 2% y confianza ≥ 20%; no hay una regla para evaluar.</p>}
      {analysis && <>
        <div className="sub" style={{ margin: '10px 0' }}>Dataset: <b>{data.fileName}</b> · {analysis.baskets.length} tickets {data.synthetic ? '· sintético' : '· cargado por el usuario'}</div>
        {data.synthetic && <p className="sub" style={{ color: 'var(--warning)' }}>Los resultados corresponden a datos sintéticos de demostración.</p>}
        <div className="btns-group" style={{ gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
          <label className="sub">Regla <select aria-label="Regla a evaluar" value={selected?.key ?? ''} onChange={(e) => { setRuleKey(e.target.value); setResult(null) }} style={{ maxWidth: 360 }}>{options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></label>
          <label className="sub">Iteraciones <select aria-label="Cantidad de iteraciones" value={iterations} onChange={(e) => setIterations(Number(e.target.value))}><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option><option value={1000}>1000</option></select></label>
          <label className="sub">Soporte mínimo <select aria-label="Soporte mínimo Bootstrap" value={minSupport} onChange={(e) => setMinSupport(Number(e.target.value))}><option value={1}>1%</option><option value={2}>2%</option><option value={3}>3%</option><option value={5}>5%</option></select></label>
          <button className="btn btn-gold" onClick={run} disabled={!selected}>▶ Ejecutar Bootstrap</button>
        </div>
        {result && <>
          <div className="mc-stats">
            <div className="mc-kpi"><small>Aparición de la regla</small><b>{pctEs(result.appearanceRate, 1)}</b><span className="sub">{result.appearances} / {result.iterations} muestras</span></div>
            <div className="mc-kpi"><small>Confianza media</small><b>{pctEs(result.confidenceMean ?? 0, 1)}</b><span className="sub">P5–P95: {pctEs(result.confidenceP05 ?? 0, 1)} – {pctEs(result.confidenceP95 ?? 0, 1)}</span></div>
            <div className="mc-kpi"><small>Lift medio</small><b>{mean(result.liftMean)}</b><span className="sub">P5–P95: {mean(result.liftP05)} – {mean(result.liftP95)}</span></div>
            <div className="mc-kpi"><small>Muestras con antecedente</small><b>{result.values}</b><span className="sub">Sobre {result.iterations} remuestreos</span></div>
          </div>
          <p className="sub" style={{ marginTop: 10 }}>Regla evaluada: {selected?.label}. Semilla reproducible: 42. Los intervalos P5–P95 describen la distribución empírica del remuestreo; no deben interpretarse como garantía de desempeño futuro.</p>
        </>}
      </>}
    </div>
  )
}
