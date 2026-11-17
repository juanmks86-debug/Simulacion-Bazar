import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import { calibrationParams, type PackMesaMetrics } from '../sim/calibration'
import { clearData, loadCsvText } from '../sim/dataStore'
import { setParam } from '../sim/params'
import { sampleCsv } from '../sim/sampleData'
import type { SalesSummary } from '../sim/salesData'
import { money } from '../sim/calculator'
import RulesTable, { pctEs } from '../components/RulesTable'

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsText(file)
  })
}

export function DataSummary({ summary }: { summary: SalesSummary }) {
  return (
    <>
      <div className="mc-stats">
        <div className="mc-kpi"><small>Tickets</small><b id="dTickets">{summary.tickets}</b></div>
        <div className="mc-kpi"><small>Líneas / unidades</small><b id="dLines">{summary.lines} / {summary.units}</b></div>
        <div className="mc-kpi"><small>Productos distintos</small><b id="dProducts">{summary.products}</b></div>
        <div className="mc-kpi"><small>Ingresos · ítems por ticket</small><b>{summary.revenue === null ? '—' : money(summary.revenue)} · {summary.avgBasket.toFixed(2).replace('.', ',')}</b></div>
      </div>
      {summary.from && <div className="sub" style={{ marginTop: 6 }}>Período: {summary.from} a {summary.to}</div>}
      <table className="custom-table" style={{ marginTop: 10 }}>
        <thead><tr><th>Producto más vendido (por tickets)</th><th>Tickets</th><th>Unidades</th><th>Ingresos</th></tr></thead>
        <tbody>
          {summary.top.map((t) => (
            <tr key={t.product}><td>{t.product}</td><td>{t.tickets}</td><td>{t.units}</td><td>{t.revenue === null ? '—' : money(t.revenue)}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export function PackMesaCheck({ pack }: { pack: PackMesaMetrics }) {
  if (pack.missing.length) {
    return <div className="sub">No puedo evaluar el Pack Mesa: no encontré en tus datos producto(s) que contengan «{pack.missing.join('», «')}».</div>
  }
  const p = pack.pack, s = pack.step
  return (
    <table className="custom-table" id="dataPack">
      <thead><tr><th>Regla</th><th>Soporte</th><th>Confianza</th><th>Lift</th><th>Casos</th></tr></thead>
      <tbody>
        <tr>
          <td>Informe: Platos + Servilletero + Tazas ➜ Canasta</td>
          <td>2,13% (4/188)</td><td>57,1%</td><td>3,47×</td><td>4 de 7</td>
        </tr>
        <tr style={{ background: 'var(--card-alt)' }}>
          <td><b>Tus datos: Platos + Servilletero + Tazas ➜ Canasta</b></td>
          <td>{p ? pctEs(p.support, 2) : '—'}</td>
          <td><b>{p?.confidence != null ? pctEs(p.confidence) : 'sin casos'}</b></td>
          <td>{p?.lift != null ? p.lift.toFixed(2).replace('.', ',') + '×' : '—'}</td>
          <td>{p ? `${p.count} de ${p.antecedentCount}` : '—'}</td>
        </tr>
        <tr>
          <td>Tus datos: Platos ➜ Tazas + Servilletero (forma el combo)</td>
          <td>{s ? pctEs(s.support, 2) : '—'}</td>
          <td>{s?.confidence != null ? pctEs(s.confidence) : 'sin casos'}</td>
          <td>{s?.lift != null ? s.lift.toFixed(2).replace('.', ',') + '×' : '—'}</td>
          <td>{s ? `${s.count} de ${s.antecedentCount}` : '—'}</td>
        </tr>
      </tbody>
    </table>
  )
}

// Carga de ventas reales (CSV): resumen, reglas Apriori y calibración de la simulación
export default function Datos() {
  const [minSup, setMinSup] = useState(2)
  const [minConf, setMinConf] = useState(30)
  const [calibrated, setCalibrated] = useState<string | null>(null)
  const { data, analysis } = useAnalysis(minSup / 100, minConf / 100)

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCalibrated(null)
    loadCsvText(await readFile(file), file.name)
    e.target.value = ''
  }

  const calibrate = () => {
    if (!analysis) return
    const c = calibrationParams(analysis.pack)
    if (c.sC === undefined && c.sB === undefined) { setCalibrated('No hay casos suficientes en los datos para calibrar.'); return }
    if (c.sC !== undefined) setParam('sC', c.sC)
    if (c.sB !== undefined) setParam('sB', c.sB)
    setCalibrated(`Listo: probabilidad de formar el combo = ${c.sC ?? 'sin cambios'}%, de sumar la canasta = ${c.sB ?? 'sin cambios'}%.`)
  }

  return (
    <div className="card card-highlight" id="datos">
      <div className="eyebrow">Validación con datos reales</div>
      <h2>📁 Ventas reales (CSV)</h2>
      <div className="sub">
        Cargá un CSV con una fila por producto vendido. Columnas obligatorias: <b>ticket</b> y <b>producto</b>. Opcionales: <b>cantidad</b>, <b>precio</b>, <b>fecha</b>.
        Separador coma, punto y coma o tabulación. Los datos se procesan en tu navegador: no se envían a ningún servidor.
      </div>

      <div className="btns-group no-print" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        <label className="btn btn-gold" style={{ cursor: 'pointer' }}>
          ⇧ Cargar CSV
          <input id="csvFile" type="file" accept=".csv,.txt,text/csv" onChange={onFile} style={{ display: 'none' }} />
        </label>
        <button className="btn" id="csvSample" onClick={() => { setCalibrated(null); loadCsvText(sampleCsv(), 'ventas_ejemplo_sintetico.csv', true) }}>Probar con ejemplo sintético</button>
        <button className="btn" id="csvTemplate" onClick={() => download('ventas_ejemplo_sintetico.csv', sampleCsv())}>⇩ Descargar plantilla</button>
        {data.sales.length > 0 && <button className="btn" id="csvClear" onClick={() => { setCalibrated(null); clearData() }}>Quitar datos</button>}
      </div>

      {data.error && <div id="csvError" role="alert" style={{ marginTop: 10, color: '#ff8f84', fontSize: 13 }}>⚠ {data.error}</div>}
      {data.warnings.map((w) => <div key={w} className="sub" style={{ marginTop: 6, color: 'var(--warning)' }}>ℹ {w}</div>)}

      {!analysis && !data.error && (
        <div className="sub" style={{ marginTop: 12 }}>Todavía no cargaste datos. Podés empezar con el ejemplo sintético para ver cómo funciona (no son ventas reales).</div>
      )}

      {analysis && (
        <div style={{ marginTop: 12 }}>
          <div className="sub" id="csvName" style={{ marginBottom: 8 }}>
            Archivo: <b style={{ color: '#fff' }}>{data.fileName}</b>
            {data.synthetic && <b style={{ color: 'var(--warning)' }}> · DATOS DE EJEMPLO SINTÉTICOS (no son ventas reales)</b>}
          </div>
          <DataSummary summary={analysis.summary} />

          <h3 style={{ color: '#fff', fontSize: 13, margin: '16px 0 6px' }}>Pack Mesa Completa en tus datos</h3>
          <PackMesaCheck pack={analysis.pack} />
          <div className="no-print" style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" id="csvCalibrate" onClick={calibrate}>🎯 Calibrar la simulación con estos datos</button>
            {calibrated && <span className="sub" id="csvCalibrated">{calibrated} <Link to="/simulacion" style={{ color: 'var(--gold)' }}>Ver simulación</Link></span>}
          </div>

          <h3 style={{ color: '#fff', fontSize: 13, margin: '16px 0 6px' }}>Reglas de asociación (Apriori) con tus datos</h3>
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
            <div className="ctrl-row"><div className="ctrl-label">Soporte mínimo: <b>{minSup}%</b></div>
              <input id="minSup" type="range" min={1} max={20} step={1} value={minSup} onChange={(e) => setMinSup(Number(e.target.value))} /></div>
            <div className="ctrl-row"><div className="ctrl-label">Confianza mínima: <b>{minConf}%</b></div>
              <input id="minConf" type="range" min={10} max={90} step={5} value={minConf} onChange={(e) => setMinConf(Number(e.target.value))} /></div>
          </div>
          <RulesTable rules={analysis.rules} />
          <div className="sub" style={{ marginTop: 6, fontSize: 11 }}>
            {analysis.itemsets.length} conjuntos frecuentes · {analysis.rules.length} reglas · ordenadas por lift (más de 1 = se compran juntos más de lo esperado por azar).
          </div>
        </div>
      )}
    </div>
  )
}
