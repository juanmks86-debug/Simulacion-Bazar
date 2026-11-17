import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSim } from '../hooks/useSim'
import { useStore } from '../hooks/useStore'
import { useDemandSummary } from '../hooks/useDynamicCatalog'
import { controller } from '../sim/controller'
import { money } from '../sim/calculator'
import { norm } from '../sim/csv'
import { DEFAULT_PARAMS, simulate, type McParams, type PromoScope } from '../sim/monteCarloDynamic'
import { addScenario, clearScenarios, removeScenario, scenarioStore } from '../sim/scenarioStore'

const pct = (n: number) => n.toFixed(1).replace('.', ',') + '%'
const signed = (n: number) => (n >= 0 ? '+' : '−') + money(Math.abs(n))
const SCOPE_LABEL: Record<PromoScope, string> = { slow: 'baja rotación', fast: 'alta rotación', all: 'todos los productos', custom: 'productos elegidos' }
const TOOLTIP = { background: '#14283D', border: '1px solid #29445D', color: '#F2F7FB' }
const FORM_DEFAULTS: McParams = { ...DEFAULT_PARAMS, iterations: 5000, scope: 'slow' }

// Comparador de escenarios comerciales: cada escenario es una promoción evaluada con Monte Carlo sobre el CSV activo.
export default function Scenarios() {
  const list = useSim((s) => s.scenarios)
  const saved = useStore(scenarioStore, (s) => s.items)
  const { summary, data } = useDemandSummary()
  const dataset = data.fileName ?? ''
  const [form, setForm] = useState<McParams>(FORM_DEFAULTS)
  const [name, setName] = useState('')
  const [filter, setFilter] = useState('')
  const set = <K extends keyof McParams>(k: K, v: McParams[K]) => setForm((f) => ({ ...f, [k]: v }))
  const mine = useMemo(() => saved.filter((s) => s.dataset === dataset), [saved, dataset])
  const best = mine.length ? mine.reduce((a, b) => (b.delta > a.delta ? b : a)) : null
  const ready = data.sales.length > 0 && summary.products.length > 0
  const chosen = form.productIds ?? []
  const shown = summary.products.filter((p) => norm(p.name).includes(norm(filter)))
  const label = `${Math.round(form.discount * 100)}% OFF · +${Math.round(form.demandUplift * 100)}% demanda · ${form.scope === 'custom' ? `${chosen.length} producto(s) elegido(s)` : SCOPE_LABEL[form.scope]}`
  const invalid = form.scope === 'custom' && chosen.length === 0

  const save = () => {
    if (!ready || invalid) return
    const r = simulate(summary.products, form, Math.random)
    if (r) { addScenario(name.trim() || label, dataset, r); setName('') }
  }
  const chart = mine.map((s, i) => ({ key: s.id, label: `#${i + 1}`, delta: Math.round(s.delta) }))

  return (
    <div className="card" id="escenarios">
      <h2>⇄ Comparador de Escenarios Comerciales</h2>
      <div className="sub">Cada escenario es una promoción (descuento + aumento de demanda sobre los productos que elijas) evaluada con Monte Carlo sobre los productos, precios y ventas de tu CSV. Guardá varios y compará cuál conviene.</div>

      {!ready ? (
        <p className="sub" id="scenarioDynamicEmpty" style={{ marginTop: 10, color: 'var(--warning)' }}>Cargá un CSV con ventas y precios en Datos reales para evaluar escenarios comerciales con tus productos.</p>
      ) : <>
        <div className="btns-group" style={{ gap: 14, flexWrap: 'wrap', margin: '12px 0', alignItems: 'flex-end' }}>
          <label className="sub">Descuento: <b>{Math.round(form.discount * 100)}%</b>
            <input aria-label="Descuento del escenario" type="range" min="0" max="60" value={Math.round(form.discount * 100)} onChange={(e) => set('discount', Number(e.target.value) / 100)} />
          </label>
          <label className="sub">Incremento de demanda: <b>+{Math.round(form.demandUplift * 100)}%</b>
            <input aria-label="Incremento de demanda del escenario" type="range" min="0" max="300" step="5" value={Math.round(form.demandUplift * 100)} onChange={(e) => set('demandUplift', Number(e.target.value) / 100)} />
          </label>
          <label className="sub">Promoción sobre
            <select aria-label="Alcance del escenario" value={form.scope} onChange={(e) => set('scope', e.target.value as PromoScope)}>
              {(Object.keys(SCOPE_LABEL) as PromoScope[]).map((k) => <option key={k} value={k}>{SCOPE_LABEL[k]}</option>)}
            </select>
          </label>
          <label className="sub">Horizonte
            <select aria-label="Horizonte del escenario" value={form.horizonDays} onChange={(e) => set('horizonDays', Number(e.target.value))}>
              {[7, 15, 30, 60, 90].map((v) => <option key={v} value={v}>{v} días</option>)}
            </select>
          </label>
          <label className="sub">Nombre (opcional)
            <input aria-label="Nombre del escenario" value={name} onChange={(e) => setName(e.target.value)} placeholder={label} style={{ width: 220 }} />
          </label>
          <button className="btn btn-gold no-print" id="saveDynamicScenario" onClick={save} disabled={invalid}>＋ Calcular y guardar escenario</button>
        </div>

        {form.scope === 'custom' && (
          <div style={{ marginBottom: 10 }}>
            <input aria-label="Buscar producto del escenario" placeholder="Buscar producto…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 240, marginBottom: 6 }} />
            <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: 8, padding: 6 }}>
              {shown.map((p) => (
                <label key={p.id} className="sub" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0' }}>
                  <input type="checkbox" aria-label={`Promocionar ${p.name}`} checked={chosen.includes(p.id)} onChange={() => set('productIds', chosen.includes(p.id) ? chosen.filter((x) => x !== p.id) : [...chosen, p.id])} /> {p.name} <small style={{ color: 'var(--mu)' }}>({money(p.price)})</small>
                </label>
              ))}
            </div>
            {invalid && <div className="sub" style={{ color: 'var(--warning)', marginTop: 4 }}>Elegí al menos un producto para promocionar.</div>}
          </div>
        )}

        {mine.length === 0 ? (
          <div className="sub" id="scenarioDynamicList">Aún no hay escenarios comerciales calculados para este dataset.</div>
        ) : <>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" id="scenarioDynamicList">
              <thead><tr><th>#</th><th>Escenario</th><th>Ganancia media</th><th>Vs. situación actual</th><th>Prob. de superar la actual</th><th>Prob. de pérdida</th><th>Rentabilidad</th><th>Rango 95%</th><th></th></tr></thead>
              <tbody>
                {mine.map((s, i) => (
                  <tr key={s.id} style={best?.id === s.id && mine.length > 1 ? { background: 'var(--card-alt)' } : undefined}>
                    <td>{i + 1}</td>
                    <td><b>{s.name}</b>{best?.id === s.id && mine.length > 1 && <span title="Mayor ganancia incremental"> 🏆</span>}<br /><small style={{ color: 'var(--mu)' }}>{s.promotedCount} de {s.productsCount} productos · {s.params.horizonDays} días · {s.params.iterations.toLocaleString('es-AR')} iteraciones</small></td>
                    <td>{money(s.meanPromo)}</td>
                    <td style={{ color: s.delta >= 0 ? '#79e29a' : '#cf483d' }}>{signed(s.delta)}</td>
                    <td><b>{pct(s.pBeat)}</b></td><td>{pct(s.pLoss)}</td><td>{pct(s.marginPct * 100)}</td>
                    <td><small>{money(s.p025)} a {money(s.p975)}</small></td>
                    <td><button className="mini-btn no-print" aria-label={`Quitar escenario ${i + 1}`} onClick={() => removeScenario(s.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mine.length > 1 && (
            <div role="img" aria-label="Ganancia incremental por escenario" style={{ width: '100%', height: 180, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#29445D" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#A9BED0', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#A9BED0', fontSize: 10 }} width={64} tickFormatter={(v) => money(Number(v))} />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v) => [money(Number(v)), 'Ganancia incremental']} />
                  <ReferenceLine y={0} stroke="#cf483d" />
                  <Bar dataKey="delta" isAnimationActive={false}>{chart.map((d) => <Cell key={d.key} fill={d.delta >= 0 ? '#3ea05d' : '#cf483d'} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="sub" style={{ marginTop: 6 }}>
            «Vs. situación actual» compara cada promoción con no hacer nada, dentro de la misma simulación. Los costos salen del catálogo (margen asumido si el CSV no trae costos) y la respuesta de la demanda es un supuesto tuyo, no un dato del CSV.
            <button className="mini-btn no-print" style={{ marginLeft: 8 }} onClick={() => clearScenarios(dataset)}>Quitar todos</button>
          </div>
        </>}
      </>}

      <h3 style={{ color: '#fff', fontSize: 12, margin: '18px 0 6px' }}>📸 Fotos de la simulación animada del bazar</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div className="sub">Resultados guardados desde la simulación 3D (Pack Mesa original).</div>
        <button className="mini-btn btn-gold no-print" id="saveScenario" onClick={() => controller.saveScenario()}>＋ Guardar Escenario Actual</button>
      </div>
      <div className="sub" id="scenarioList" style={{ maxHeight: 170, overflowY: 'auto' }}>
        {list.length === 0 && 'Todavía no guardaste escenarios.'}
        {list.map((a, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <b>{i + 1}. {a.promo}</b><br />
              <small style={{ color: 'var(--mu)' }}>Combo {a.comboProb}% · Canasta {a.basketProb}% · {a.visits} visitas · {a.combos} packs</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <b>{money(a.revenue)}</b><br />
              <small style={{ color: '#60c572' }}>Margen: {money(a.margin)}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
