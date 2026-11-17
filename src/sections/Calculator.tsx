import { useMemo, useState } from 'react'
import { comboCalc, money, packCalc } from '../sim/calculator'
import { useAnalysis } from '../hooks/useAnalysis'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'
import { norm } from '../sim/csv'

// Verificación financiera del Pack Mesa original (Sección 8.4): se muestra cuando no hay un CSV cargado.
function StaticCalculator() {
  const [desc, setDesc] = useState(15)
  const c = comboCalc(desc)
  return (
    <div className="card" id="calculadora">
      <div className="eyebrow">Verificación Financiera Rigurosa · Sección 8.4</div>
      <h2>🧮 Definiciones Financieras y Verificación de Margen</h2>
      <div className="calc-grid">
        <div>
          <div className="ctrl-row">
            <div className="ctrl-label">Descuento aplicado en Canasta de Mimbre: <b><span id="calcDescVal">{desc}</span>%</b></div>
            <input id="calcDescRange" type="range" min={5} max={35} step={1} value={desc} onChange={(e) => setDesc(Number(e.target.value))} />
          </div>
          <table className="custom-table" style={{ marginTop: "12px" }}>
            <thead>
              <tr>
                <th>
                  Ítem
                </th>
                <th>
                  PVP Regular
                </th>
                <th>
                  Costo Real
                </th>
                <th>
                  PVP en Combo
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Platos Londres (Alta)
                </td>
                <td>
                  $ 14.000
                </td>
                <td>
                  $ 8.400
                </td>
                <td>
                  $ 14.000
                </td>
              </tr>
              <tr>
                <td>
                  Servilletero (Alta)
                </td>
                <td>
                  $ 2.000
                </td>
                <td>
                  $ 1.200
                </td>
                <td>
                  $ 2.000
                </td>
              </tr>
              <tr>
                <td>
                  Tazas de café (Alta)
                </td>
                <td>
                  $ 2.000
                </td>
                <td>
                  $ 1.200
                </td>
                <td>
                  $ 2.000
                </td>
              </tr>
              <tr>
                <td>
                  Canasta de mimbre (Estancada)
                </td>
                <td>
                  $ 35.000
                </td>
                <td>
                  $ 14.000
                </td>
                <td id="calcCanastaPVP" style={{ color: "var(--gold)", fontWeight: "bold" }}>{money(c.pvpCanastaCombo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="calc-result-box">
          <h3>Glosario de Términos (Devolución Docente)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <div className="mc-kpi"><small>PVP Regular Total</small><b id="calcPvpReg">{money(c.pvpRegularTotal)}</b></div>
            <div className="mc-kpi"><small>PVP Final Combo</small><b id="calcPvpCombo" style={{ color: 'var(--gold)' }}>{money(c.pvpCombo)}</b></div>
            <div className="mc-kpi"><small>Costo de Reposición</small><b id="calcCostoTot">{money(c.costoTotal)}</b></div>
            <div className="mc-kpi"><small>Ahorro del Cliente</small><b id="calcAhorro" style={{ color: '#70bcf5' }}>{money(c.ahorro)}</b></div>
            <div className="mc-kpi"><small>Margen Sin Combo</small><b id="calcMargenSin">{c.margenSin.toFixed(1)}%</b></div>
            <div className="mc-kpi"><small>Margen Con Combo</small><b id="calcMargenCon" style={{ color: '#60c572' }}>{c.margenCon.toFixed(1)}%</b></div>
          </div>
          <div className="sub" id="calcConclusion" style={{ marginTop: 10 }}>
            Caída de margen bruto porcentual: <b style={{ color: 'var(--gold)' }}>-{c.perdidaPP.toFixed(1)} puntos porcentuales (pp)</b>. Margen resultante:{' '}
            <b style={{ color: '#60c572' }}>{c.margenCon.toFixed(1)}%</b>. Ahorro para el cliente: <b>{money(c.ahorro)}</b>.
          </div>
        </div>
      </div>
    </div>
  )
}

const pctText = (n: number) => n.toFixed(1).replace('.', ',') + '%'

// Verificación financiera de un pack armado con los productos del CSV activo.
function DynamicCalculator({ analysisRules }: { analysisRules: { antecedent: string[]; consequent: string[]; support: number; lift: number }[] }) {
  const { products, data } = useDynamicCatalog()
  const priced = useMemo(() => products.filter((p) => p.p > 0), [products])
  // Pack inicial: la regla más frecuente del dataset; el descuento va sobre su consecuente.
  const initial = useMemo(() => {
    const byName = new Map(priced.map((p) => [norm(p.n), p.id]))
    const rule = [...analysisRules].sort((a, b) => b.support - a.support || b.lift - a.lift)
      .find((r) => [...r.antecedent, ...r.consequent].every((n) => byName.has(norm(n))) && new Set([...r.antecedent, ...r.consequent]).size >= 2)
    if (rule) return { ids: [...new Set([...rule.antecedent, ...rule.consequent])].map((n) => byName.get(norm(n)) as string), disc: byName.get(norm(rule.consequent[0])) as string }
    return { ids: priced.slice(0, 2).map((p) => p.id), disc: priced[1]?.id ?? priced[0]?.id ?? '' }
  }, [analysisRules, priced])
  const [picked, setPicked] = useState<string[] | null>(null)
  const [discId, setDiscId] = useState<string | null>(null)
  const [desc, setDesc] = useState(15)
  const [filter, setFilter] = useState('')
  const ids = (picked ?? initial.ids).filter((id) => priced.some((p) => p.id === id))
  const selected = ids.map((id) => priced.find((p) => p.id === id)!)
  const discountedId = selected.some((p) => p.id === (discId ?? initial.disc)) ? (discId ?? initial.disc) : (selected[0]?.id ?? '')
  const c = packCalc(selected.map((p) => ({ name: p.n, pvp: p.p, costo: p.costo })), selected.map((p, i) => (p.id === discountedId ? i : -1)).filter((i) => i >= 0), desc)
  const toggle = (id: string) => setPicked(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  const shown = priced.filter((p) => norm(p.n).includes(norm(filter)))
  const discName = selected.find((p) => p.id === discountedId)?.n ?? 'producto'

  return (
    <div className="card" id="calculadora">
      <div className="eyebrow">Verificación Financiera · pack armado con tu CSV</div>
      <h2>🧮 Definiciones Financieras y Verificación de Margen</h2>
      <div className="sub">Dataset: <b>{data.fileName ?? 'CSV cargado'}</b>. Elegí los productos del pack y a cuál le aplicás el descuento. Los precios salen del CSV y los costos del catálogo (editables en Catálogo).</div>
      <div className="calc-grid" style={{ marginTop: 10 }}>
        <div>
          <input aria-label="Buscar producto" placeholder="Buscar producto…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: 8, padding: 6 }}>
            {shown.map((p) => (
              <label key={p.id} className="sub" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0' }}>
                <input type="checkbox" checked={ids.includes(p.id)} onChange={() => toggle(p.id)} aria-label={`Incluir ${p.n}`} /> {p.n} <small style={{ color: 'var(--mu)' }}>({money(p.p)})</small>
              </label>
            ))}
            {!shown.length && <div className="sub">Ningún producto coincide.</div>}
          </div>
          {selected.length < 2 ? <p className="sub" style={{ color: 'var(--warning)', marginTop: 8 }}>Elegí al menos 2 productos para armar un pack.</p> : <>
            <div className="ctrl-row" style={{ marginTop: 10 }}>
              <label className="sub">Descuento sobre{' '}
                <select aria-label="Producto con descuento" value={discountedId} onChange={(e) => setDiscId(e.target.value)}>
                  {selected.map((p) => <option key={p.id} value={p.id}>{p.n}</option>)}
                </select>
              </label>
              <div className="ctrl-label">Descuento aplicado en {discName}: <b><span id="calcDescVal">{desc}</span>%</b></div>
              <input id="calcDescRange" type="range" min={0} max={60} step={1} value={desc} onChange={(e) => setDesc(Number(e.target.value))} />
            </div>
            <table className="custom-table" style={{ marginTop: 12 }}>
              <thead><tr><th>Ítem</th><th>PVP Regular</th><th>Costo</th><th>PVP en Combo</th></tr></thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td><td>{money(r.pvp)}</td><td>{money(r.costo)}</td>
                    <td style={r.discounted ? { color: 'var(--gold)', fontWeight: 'bold' } : undefined}>{money(r.pvpCombo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>}
        </div>
        {selected.length >= 2 && (
          <div className="calc-result-box">
            <h3>Resultado del pack ({selected.length} productos)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div className="mc-kpi"><small>PVP Regular Total</small><b id="calcPvpReg">{money(c.pvpRegularTotal)}</b></div>
              <div className="mc-kpi"><small>PVP Final Combo</small><b id="calcPvpCombo" style={{ color: 'var(--gold)' }}>{money(c.pvpCombo)}</b></div>
              <div className="mc-kpi"><small>Costo de Reposición</small><b id="calcCostoTot">{money(c.costoTotal)}</b></div>
              <div className="mc-kpi"><small>Ahorro del Cliente</small><b id="calcAhorro" style={{ color: '#70bcf5' }}>{money(c.ahorro)}</b></div>
              <div className="mc-kpi"><small>Margen Sin Combo</small><b id="calcMargenSin">{pctText(c.margenSin)}</b><small>{money(c.margenAbsSin)} por pack</small></div>
              <div className="mc-kpi"><small>Margen Con Combo</small><b id="calcMargenCon" style={{ color: c.margenCon >= 0 ? '#60c572' : '#cf483d' }}>{pctText(c.margenCon)}</b><small>{money(c.margenAbsCon)} por pack</small></div>
            </div>
            <div className="sub" id="calcConclusion" style={{ marginTop: 10 }}>
              Caída de margen bruto: <b style={{ color: 'var(--gold)' }}>-{c.perdidaPP.toFixed(1).replace('.', ',')} puntos porcentuales</b>. Ahorro para el cliente: <b>{money(c.ahorro)}</b>.{' '}
              {c.ventaExtraEquilibrio === null
                ? <b style={{ color: '#cf483d' }}>Con este descuento el pack deja de ganar dinero: ninguna cantidad extra de ventas lo compensa.</b>
                : c.ventaExtraEquilibrio === 0 ? 'Sin descuento no hace falta vender más.'
                : <>Para ganar lo mismo que sin descuento hay que vender <b id="calcEquilibrio" style={{ color: 'var(--gold)' }}>+{(c.ventaExtraEquilibrio * 100).toFixed(0)}% más packs</b>.</>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Calculator() {
  const { analysis } = useAnalysis(0.02, 0.2)
  const { products } = useDynamicCatalog()
  if (!analysis || products.filter((p) => p.p > 0).length < 2) return <StaticCalculator />
  return <DynamicCalculator analysisRules={analysis.rules} />
}
