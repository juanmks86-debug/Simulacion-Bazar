import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { histogram } from '../sim/stats'
import { money } from '../sim/calculator'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'
import {
  DEFAULT_PARAMS, buildDemand, overlayHistogram, sensitivityByUplift, simulate,
  type McParams, type PromoScope, type ScenarioStats,
} from '../sim/monteCarloDynamic'

const pct = (n: number, d = 1) => n.toFixed(d).replace('.', ',') + '%'
const frac = (n: number, d = 1) => pct(n * 100, d)
const signed = (n: number) => (n >= 0 ? '+' : '−') + money(Math.abs(n))
const SCOPES: Record<PromoScope, string> = { slow: 'Productos de baja rotación', fast: 'Productos de alta rotación', all: 'Todos los productos', custom: 'Productos elegidos' }
const SCOPE_OPTIONS: PromoScope[] = ['slow', 'fast', 'all']
const TOOLTIP = { background: '#14283D', border: '1px solid #29445D', color: '#F2F7FB' }

function ScenarioCard({ title, s, color }: { title: string; s: ScenarioStats; color?: string }) {
  return (
    <div className="mc-kpi" style={{ textAlign: 'left' }}>
      <small style={{ color }}>{title}</small>
      <b style={{ color: color ?? '#fff' }}>{money(s.mean)}</b>
      <small>IC 95% de la media: {money(s.ciMean[0])} a {money(s.ciMean[1])}</small>
      <small>Rango 95% simulado: {money(s.p025)} a {money(s.p975)}</small>
      <small>Mínima {money(s.min)} · Máxima {money(s.max)}</small>
      <small>Probabilidad de pérdida: <b style={{ display: 'inline', fontSize: 11, color: s.pLoss > 5 ? '#cf483d' : '#79e29a' }}>{pct(s.pLoss)}</b></small>
      {s.pBeatActual !== null && <small>Probabilidad de superar la situación actual: <b style={{ display: 'inline', fontSize: 11, color: '#d8b675' }}>{pct(s.pBeatActual)}</b></small>}
      <small>Ingresos medios {money(s.meanRevenue)} · rentabilidad {frac(s.marginPct)}</small>
    </div>
  )
}

// Evaluación financiera Monte Carlo dinámica: demanda, precios y costos salen del CSV y del catálogo cargado.
export default function MonteCarlo() {
  const { products, data } = useDynamicCatalog()
  const [draft, setDraft] = useState<McParams>(DEFAULT_PARAMS)
  const [applied, setApplied] = useState<{ params: McParams; run: number }>({ params: DEFAULT_PARAMS, run: 0 })
  const [showAll, setShowAll] = useState(false)

  const summary = useMemo(
    () => buildDemand(data.sales, products.map((p) => ({ id: p.id, name: p.n, price: p.p, cost: p.costo, rot: p.rot }))),
    [data.sales, products],
  )
  const result = useMemo(() => simulate(summary.products, applied.params), [summary, applied])
  const sens = useMemo(() => sensitivityByUplift(summary.products, applied.params), [summary, applied])
  const set = <K extends keyof McParams>(k: K, v: McParams[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const run = () => setApplied((a) => ({ params: draft, run: a.run + 1 }))

  const overlay = useMemo(() => result ? overlayHistogram(result.sample.actual, result.sample.promo, 40, (n) => money(n)) : [], [result])
  const diffBins = useMemo(() => result ? histogram(result.sample.diffPromo, 50).map((b) => ({ mid: b.mid, count: b.count, label: money(b.mid) })) : [], [result])
  const nearest = (v: number) => diffBins.reduce((best, d) => (Math.abs(d.mid - v) < Math.abs(best.mid - v) ? d : best), diffBins[0])
  const zeroBin = diffBins.length && diffBins[0].mid <= 0 && diffBins[diffBins.length - 1].mid >= 0 ? nearest(0) : null
  const diffMean = result ? result.promo.mean - result.actual.mean : 0
  const meanBin = diffBins.length ? nearest(diffMean) : null
  const rows = result ? (showAll ? result.products : result.products.slice(0, 15)) : []
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied.params)

  return (
    <div className="card card-highlight" id="montecarlo">
      <div className="eyebrow">Técnica Complementaria · Sección 10.2 &amp; 14.2</div>
      <h2>🎲 Evaluación Financiera Monte Carlo dinámica</h2>
      <div className="sub">
        Simula miles de escenarios con <b>todos los productos del CSV</b>: la demanda se estima con las unidades vendidas por día, y los precios y costos salen del catálogo (si el CSV no trae costos, se asume el margen del catálogo, editable en la pestaña Catálogo).
        Los resultados son escenarios de análisis, no predicciones ni garantías.
      </div>

      {!data.sales.length || !summary.products.length ? (
        <p className="sub" style={{ marginTop: 12, color: 'var(--warning)' }}>
          No hay productos con ventas y precio para simular. Cargá un CSV con producto, cantidad y precio en Datos reales.
        </p>
      ) : <>
        <div className="sub" style={{ marginTop: 10 }}>
          Dataset: <b>{data.fileName ?? 'CSV cargado'}</b> · {summary.products.length} productos simulados · período observado: {summary.observedDays} días
          {!summary.hasDates && <span style={{ color: 'var(--warning)' }}> (el CSV no tiene fechas válidas: se asumió {summary.observedDays} días y demanda Poisson)</span>}
          {summary.hasDates && summary.observedDays < 14 && <span style={{ color: 'var(--warning)' }}> · período corto: la variabilidad estimada es poco confiable</span>}
          {summary.excluded.length > 0 && <span> · excluidos: {summary.excluded.map((e) => `${e.name} (${e.reason})`).join(', ')}</span>}
        </div>

        <div className="btns-group" style={{ gap: 14, flexWrap: 'wrap', margin: '14px 0', alignItems: 'flex-end' }}>
          <label className="sub">Horizonte (días)
            <select aria-label="Horizonte de simulación" value={draft.horizonDays} onChange={(e) => set('horizonDays', Number(e.target.value))}>
              {[7, 15, 30, 60, 90, 180, 365].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="sub">Iteraciones
            <select aria-label="Cantidad de iteraciones" value={draft.iterations} onChange={(e) => set('iterations', Number(e.target.value))}>
              {[1000, 5000, 10000, 25000, 50000].map((v) => <option key={v} value={v}>{v.toLocaleString('es-AR')}</option>)}
            </select>
          </label>
          <label className="sub">Incremento de demanda: <b>+{Math.round(draft.demandUplift * 100)}%</b>
            <input aria-label="Incremento de demanda" type="range" min="0" max="300" step="5" value={Math.round(draft.demandUplift * 100)} onChange={(e) => set('demandUplift', Number(e.target.value) / 100)} />
          </label>
          <label className="sub">Descuento: <b>{Math.round(draft.discount * 100)}%</b>
            <input aria-label="Porcentaje de descuento" type="range" min="0" max="60" step="1" value={Math.round(draft.discount * 100)} onChange={(e) => set('discount', Number(e.target.value) / 100)} />
          </label>
          <label className="sub">Promoción sobre
            <select aria-label="Alcance de la promoción" value={draft.scope} onChange={(e) => set('scope', e.target.value as PromoScope)}>
              {SCOPE_OPTIONS.map((k) => <option key={k} value={k}>{SCOPES[k]}</option>)}
            </select>
          </label>
          <label className="sub">Costos fijos del período ($)
            <input aria-label="Costos fijos del período" type="number" min="0" step="1000" value={draft.fixedCosts} onChange={(e) => set('fixedCosts', Math.max(0, Number(e.target.value) || 0))} style={{ width: 110 }} />
          </label>
          <button className="btn btn-gold" id="btnRunMC" onClick={run}>▶ {dirty ? 'Aplicar y ejecutar' : 'Re-ejecutar'} {draft.iterations.toLocaleString('es-AR')} escenarios</button>
        </div>

        {result && <>
          <div className="sub">
            Se simularon <b>{result.params.iterations.toLocaleString('es-AR')}</b> escenarios de <b>{result.params.horizonDays} días</b>.
            Promoción: <b>{frac(result.params.discount, 0)} de descuento</b> con <b>+{Math.round(result.params.demandUplift * 100)}% de demanda</b> sobre {SCOPES[result.params.scope].toLowerCase()} ({result.promotedCount} de {result.products.length}).
            {result.promotedCount === 0 && <span style={{ color: 'var(--warning)' }}> Ningún producto entra en ese alcance: la promoción no cambia nada.</span>}
          </div>
          <div className="mc-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 10 }}>
            <ScenarioCard title="A · Situación actual (sin promoción)" s={result.actual} />
            <ScenarioCard title="B · Promoción con respuesta de demanda" s={result.promo} color="#79e29a" />
            <ScenarioCard title="C · Descuento sin aumento de demanda (riesgo)" s={result.discountOnly} color="#d8b675" />
          </div>
          <div className="sub" style={{ marginTop: 8 }}>
            Ganancia = ingresos − costos − costos fijos. Variaciones simuladas: ventas (Poisson o Binomial negativa según la dispersión de cada producto), precios (±{frac(Math.max(...summary.products.map((p) => p.priceCV)), 0)} como máximo, según el CSV, con un piso del 2%) y costos (±{frac(result.params.costSd, 0)}).
            La promoción B suma ventas extra sobre la demanda base de cada escenario; el escenario C muestra qué pasa si el descuento no mueve las ventas.
            Beneficio medio de B frente a A: <b style={{ color: diffMean >= 0 ? '#79e29a' : '#cf483d' }}>{signed(diffMean)}</b>.
          </div>

          <h3 style={{ color: '#fff', fontSize: 12, margin: '16px 0 6px' }}>📈 Distribución de la ganancia: situación actual (A) vs promoción (B)</h3>
          <div role="img" aria-label="Histograma comparativo de ganancia entre la situación actual y la promoción" style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overlay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap={1}>
                <CartesianGrid stroke="#29445D" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#A9BED0', fontSize: 10 }} interval={7} />
                <YAxis tick={{ fill: '#A9BED0', fontSize: 10 }} width={40} />
                <Tooltip contentStyle={TOOLTIP} labelFormatter={(l) => `Ganancia ≈ ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="a" name="A · actual" fill="#6f8fb0" isAnimationActive={false} fillOpacity={0.85} />
                <Bar dataKey="b" name="B · promoción" fill="#3ea05d" isAnimationActive={false} fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ color: '#fff', fontSize: 12, margin: '16px 0 6px' }}>⚖️ Diferencia de ganancia por escenario (B − A)</h3>
          <div role="img" aria-label="Histograma de la diferencia de ganancia B menos A" style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffBins} margin={{ top: 16, right: 16, left: 0, bottom: 0 }} barCategoryGap={1}>
                <CartesianGrid stroke="#29445D" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#A9BED0', fontSize: 10 }} interval={9} />
                <YAxis tick={{ fill: '#A9BED0', fontSize: 10 }} width={40} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v) => [v, 'Escenarios']} labelFormatter={(l) => `Diferencia ≈ ${l}`} />
                <Bar dataKey="count" isAnimationActive={false}>
                  {diffBins.map((d) => (<Cell key={d.mid} fill={d.mid >= 0 ? '#3ea05d' : '#cf483d'} />))}
                </Bar>
                {zeroBin && <ReferenceLine x={zeroBin.label} stroke="#cf483d" strokeWidth={2} label={{ value: 'Equilibrio ($0)', fill: '#cf483d', fontSize: 10, position: 'insideTopRight' }} />}
                {meanBin && <ReferenceLine x={meanBin.label} stroke="#d8b675" strokeWidth={2.5} strokeDasharray="4 4" label={{ value: `Media: ${signed(diffMean)}`, fill: '#d8b675', fontSize: 11, position: 'top' }} />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ color: '#fff', fontSize: 12, margin: '16px 0 6px' }}>🏆 Ranking de productos por rentabilidad esperada</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead><tr><th>#</th><th>Producto</th><th>Demanda</th><th>Unidades esperadas</th><th>Margen unitario</th><th>Ganancia esperada (A)</th><th>Variabilidad (desvío)</th><th>Con promoción (B)</th><th>Efecto promo</th></tr></thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td><td>{p.name}</td>
                    <td>{p.model === 'negbin' ? 'Binomial negativa' : 'Poisson'}</td>
                    <td>{p.meanUnits.toFixed(1).replace('.', ',')}</td>
                    <td>{frac(p.unitMarginPct, 0)}</td>
                    <td><b>{money(p.profitActual)}</b></td>
                    <td>± {money(p.sdActual)}</td>
                    <td>{p.promoted ? money(p.profitPromo) : '—'}</td>
                    <td style={{ color: !p.promoted ? undefined : p.delta >= 0 ? '#79e29a' : '#cf483d' }}>{p.promoted ? signed(p.delta) : 'sin promoción'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.products.length > 15 && (
            <button className="btn" style={{ marginTop: 8 }} onClick={() => setShowAll((v) => !v)}>{showAll ? 'Ver solo los 15 primeros' : `Ver los ${result.products.length} productos`}</button>
          )}

          <h3 style={{ color: '#fff', fontSize: 12, margin: '16px 0 6px' }}>📊 Sensibilidad recalculada con tu CSV: ¿cuánta demanda extra necesita la promoción?</h3>
          <table className="custom-table" id="mcSensitivity">
            <thead><tr><th>Incremento de demanda</th><th>Ganancia media (B)</th><th>Diferencia vs actual</th><th>Prob. de superar la situación actual</th><th>Prob. de pérdida (B)</th></tr></thead>
            <tbody>
              {sens.map((r) => (
                <tr key={r.uplift} style={Math.abs(r.uplift - applied.params.demandUplift) < 1e-9 ? { background: 'var(--card-alt)' } : undefined}>
                  <td>+{Math.round(r.uplift * 100)}%</td><td>{money(r.meanPromo)}</td>
                  <td style={{ color: r.meanDiff >= 0 ? '#79e29a' : '#cf483d' }}>{signed(r.meanDiff)}</td>
                  <td><b>{pct(r.pBeat)}</b></td><td>{pct(r.pLoss)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sub" style={{ marginTop: 6 }}>
            Con el descuento y el alcance elegidos, esta tabla muestra a partir de qué incremento de demanda la promoción empieza a convenir. Se calcula con 2.000 escenarios por fila y cambia con cada dataset.
          </div>
        </>}
      </>}
    </div>
  )
}
