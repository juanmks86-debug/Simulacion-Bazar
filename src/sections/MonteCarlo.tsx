import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { histogram, monteCarlo } from '../sim/stats'
import { money } from '../sim/calculator'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'

// Evaluación financiera Monte Carlo (10.000 escenarios). El gráfico es responsivo (Recharts).
export default function MonteCarlo() {
  const { products, data } = useDynamicCatalog()
  const [r, setR] = useState(() => monteCarlo())
  useEffect(() => { setR(monteCarlo(Math.random, products)) }, [products])
  const selected = [...products].filter((p) => p.p > 0).sort((a, b) => (b.tickets ?? 0) - (a.tickets ?? 0)).slice(0, 2)
  const baseName = selected[0]?.n ?? 'producto base'
  const addOnName = selected[1]?.n ?? baseName
  const [view, setView] = useState<'base' | 'eq'>('base')
  const histData = view === 'base' ? r.histDiff : r.histDiffEq
  const histMean = view === 'base' ? r.diffMean : r.diffMeanEq
  const bins = histogram(histData, 50)
  const chartData = bins.map((b) => ({ mid: b.mid, count: b.count, label: money(b.mid) }))
  const nearest = (v: number) => chartData.reduce((best, d) => (Math.abs(d.mid - v) < Math.abs(best.mid - v) ? d : best), chartData[0])
  const meanBin = chartData.length ? nearest(histMean) : null
  const zeroBin = chartData.length && chartData[0].mid <= 0 && chartData[chartData.length - 1].mid >= 0 ? nearest(0) : null

  return (
    <div className="card card-highlight" id="montecarlo">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="eyebrow">Técnica Complementaria · Sección 10.2 &amp; 14.2</div>
          <h2>🎲 Evaluación Financiera Monte Carlo (10.000 Escenarios)</h2>
          <div className="sub">Simulación financiera construida con los precios y costos del catálogo CSV. Se toman los productos con mayor frecuencia de tickets; los supuestos probabilísticos son escenarios de análisis, no predicciones ni probabilidades reales de éxito.</div>
        </div>
        <button className="btn btn-gold" id="btnRunMC" onClick={() => setR(monteCarlo(Math.random, products))}>▶ Re-ejecutar 10.000 Escenarios</button>
      </div>
      <div className="sub" style={{ marginTop: 10 }}>
        <b>Base dinámica:</b> {baseName} como referencia individual{selected.length > 1 ? ` frente a un escenario combinado con ${addOnName}` : ' frente a una variante promocional del mismo producto' }. {data.sales.length ? `Dataset: ${data.fileName ?? 'CSV cargado'} · ${products.length} productos detectados.` : 'Cargá un CSV para adaptar los escenarios a sus productos.'}
      </div>
      <div className="mc-stats">
        <div className="mc-kpi"><small>Media producto base (A)</small><b id="mcMeanA">{money(r.meanA)}</b></div>
        <div className="mc-kpi"><small>Media escenario combinado (B)</small><b id="mcMeanB" style={{ color: '#79e29a' }}>{money(r.meanB)}</b></div>
        <div className="mc-kpi"><small>Beneficio Neto a Favor</small><b id="mcDiff" style={{ color: 'var(--gold)' }}>+{money(r.diffMean)}</b></div>
        <div className="mc-kpi"><small>Escenarios favorables</small><b id="mcWin" style={{ color: '#60c572' }}>{r.winRate.toFixed(1)}%</b><small>Empates: {r.tieRate.toFixed(1)}% (sin combos vendidos)</small></div>
      </div>
      <div className="sub" style={{ marginTop: 10 }}>
        <b>Control de línea base equivalente:</b> se incorpora una demanda orgánica simulada al escenario de referencia para comparar el margen incremental bajo los mismos supuestos.
      </div>
      <div className="mc-stats">
        <div className="mc-kpi"><small>Media sin combo (A equivalente)</small><b id="mcMeanAeq">{money(r.meanAeq)}</b></div>
        <div className="mc-kpi"><small>Beneficio incremental</small><b id="mcDiffEq" style={{ color: 'var(--gold)' }}>+{money(r.diffMeanEq)}</b></div>
        <div className="mc-kpi"><small>Escenarios favorables</small><b id="mcWinEq" style={{ color: '#60c572' }}>{r.winRateEq.toFixed(1)}%</b></div>
        <div className="mc-kpi"><small>Escenarios desfavorables</small><b id="mcLoseEq" style={{ color: '#cf483d' }}>{r.loseRateEq.toFixed(1)}%</b></div>
      </div>
      <div className="sub" style={{ marginTop: 6 }}>
        Variante conservadora (el margen del trío de alta rotación no se cuenta como incremental): {r.winRateCons.toFixed(1)}% favorables · {r.loseRateCons.toFixed(1)}% desfavorables · diferencia media +{money(r.diffMeanCons)}.
        Los resultados dependen de los supuestos aleatorios y de los precios/costos utilizados en esta corrida.
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button className={view === 'base' ? 'btn btn-gold' : 'btn'} onClick={() => setView('base')}>Histograma: base simplificada</button>
        <button className={view === 'eq' ? 'btn btn-gold' : 'btn'} onClick={() => setView('eq')}>Histograma: línea base equivalente</button>
      </div>
      <div role="img" aria-label="Histograma de la diferencia de margen Monte Carlo" style={{ width: '100%', height: 220, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }} barCategoryGap={1}>
            <CartesianGrid stroke="#29445D" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#A9BED0', fontSize: 10 }} interval={9} />
            <YAxis tick={{ fill: '#A9BED0', fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ background: '#14283D', border: '1px solid #29445D', color: '#F2F7FB' }} formatter={(v) => [v, 'Escenarios']} labelFormatter={(l) => `Diferencia ≈ ${l}`} />
            <Bar dataKey="count" isAnimationActive={false}>
              {chartData.map((d) => (<Cell key={d.mid} fill={d.mid >= 0 ? '#3ea05d' : '#cf483d'} />))}
            </Bar>
            {zeroBin && <ReferenceLine x={zeroBin.label} stroke="#cf483d" strokeWidth={2} label={{ value: 'Equilibrio ($0)', fill: '#cf483d', fontSize: 10, position: 'insideTopRight' }} />}
            {meanBin && <ReferenceLine x={meanBin.label} stroke="#d8b675" strokeWidth={2.5} strokeDasharray="4 4" label={{ value: `Media: +${money(histMean)}`, fill: '#d8b675', fontSize: 11, position: 'top' }} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: "14px" }}>
        <h3 style={{ color: "#fff", fontSize: "12px", marginBottom: "6px" }}>
          📊 Sensibilidad de referencia del modelo original (no recalculada con el CSV):
        </h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>
                Multiplicador de Demanda
              </th>
              <th>
                Nivel de Promoción
              </th>
              <th>
                Margen Mensual Promedio
              </th>
              <th>
                % Favorables (base simplificada)
              </th>
              <th>
                % Favorables (línea base equivalente)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                1x – 2x
              </td>
              <td>
                Promoción débil
              </td>
              <td>
                $ 87.639
              </td>
              <td>
                <b>
                  85,2%
                </b>
              </td>
              <td>
                <b>
                  50,4%
                </b>
              </td>
            </tr>
            <tr>
              <td>
                2x – 3x
              </td>
              <td>
                Promoción moderada
              </td>
              <td>
                $ 113.140
              </td>
              <td>
                <b>
                  95,9%
                </b>
              </td>
              <td>
                <b>
                  71,3%
                </b>
              </td>
            </tr>
            <tr style={{ background: "var(--card-alt)" }}>
              <td>
                <b>
                  3x – 6x (Caso base: supuesto)
                </b>
              </td>
              <td>
                <b>
                  Promoción activa (usada en informe)
                </b>
              </td>
              <td>
                <b>
                  $ 164.564
                </b>
              </td>
              <td>
                <b style={{ color: "var(--gold)" }}>
                  99,4%
                </b>
              </td>
              <td>
                <b style={{ color: "var(--gold)" }}>
                  90,3%
                </b>
              </td>
            </tr>
            <tr>
              <td>
                6x – 9x
              </td>
              <td>
                Promoción muy fuerte
              </td>
              <td>
                $ 242.832
              </td>
              <td>
                <b>
                  100,0%
                </b>
              </td>
              <td>
                <b>
                  98,7%
                </b>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="sub" style={{ marginTop: 6 }}>
          El multiplicador 3x–6x es un supuesto de caso base, no un dato observado ni un umbral calculado. Con la línea base equivalente el combo conviene solo si la promoción mueve la demanda por encima de ≈1,4x–1,7x; con una promoción débil (1x–2x) el resultado es casi un cara o cruz.
        </div>
      </div>
    </div>
  )
}
