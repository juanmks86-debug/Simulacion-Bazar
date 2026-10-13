import { useAnalysis } from '../hooks/useAnalysis'
import Kpis from '../components/Kpis'
import RulesTable from '../components/RulesTable'
import MonteCarlo from './MonteCarlo'
import RulesApriori from './RulesApriori'
import Calculator from './Calculator'
import Scenarios from './Scenarios'
import { DataSummary, PackMesaCheck } from './Datos'

// Informe de resultados listo para imprimir o guardar como PDF (Ctrl+P → "Guardar como PDF")
export default function Informe() {
  const { data, analysis } = useAnalysis(0.02, 0.3)
  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div id="informe" className="report">
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Tecnicatura Superior en Big Data e IA · IES N.º 6</div>
          <h1 style={{ margin: '2px 0' }}>Informe de resultados: Bazar Inteligente</h1>
          <div className="sub">Caso Pack Mesa Completa · Perico, Jujuy · {today}</div>
        </div>
        <button className="btn btn-gold no-print" id="printReport" onClick={() => window.print()}>🖨 Guardar como PDF / Imprimir</button>
      </div>
      <div className="sub no-print" style={{ margin: '8px 2px' }}>
        Se abre el cuadro de impresión del navegador: elegí «Guardar como PDF» como destino. Antes de imprimir, ejecutá la simulación el tiempo que quieras y guardá escenarios para que aparezcan abajo.
      </div>

      <h2 className="report-h">1. Resultados de la simulación</h2>
      <Kpis />
      <Scenarios />

      <h2 className="report-h">2. Evaluación financiera (Monte Carlo)</h2>
      <MonteCarlo />

      <h2 className="report-h">3. Reglas de asociación</h2>
      <RulesApriori />

      <h2 className="report-h">4. Verificación de margen</h2>
      <Calculator />

      {analysis && (
        <>
          <h2 className="report-h">5. Validación con datos cargados{data.synthetic ? ' (ejemplo sintético)' : ''}</h2>
          <div className="card">
            <div className="sub" style={{ marginBottom: 8 }}>Archivo: <b>{data.fileName}</b>{data.synthetic && ' · datos de ejemplo, no son ventas reales'}</div>
            <DataSummary summary={analysis.summary} />
            <h3 style={{ fontSize: 13, margin: '14px 0 6px' }}>Pack Mesa Completa en estos datos</h3>
            <PackMesaCheck pack={analysis.pack} />
            <h3 style={{ fontSize: 13, margin: '14px 0 6px' }}>Principales reglas (soporte ≥ 2%, confianza ≥ 30%)</h3>
            <RulesTable rules={analysis.rules} limit={10} />
          </div>
        </>
      )}
    </div>
  )
}
