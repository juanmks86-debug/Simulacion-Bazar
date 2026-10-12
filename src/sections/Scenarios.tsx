import { useSim } from '../hooks/useSim'
import { controller } from '../sim/controller'
import { money } from '../sim/calculator'

// Comparador de escenarios: guarda una "foto" de los resultados de la simulación actual
export default function Scenarios() {
  const list = useSim((s) => s.scenarios)
  return (
    <div className="card" id="escenarios">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2>⇄ Comparador de Escenarios Comerciales</h2>
        <button className="mini-btn btn-gold" id="saveScenario" onClick={() => controller.saveScenario()}>＋ Guardar Escenario Actual</button>
      </div>
      <div className="sub" id="scenarioList" style={{ maxHeight: 170, overflowY: 'auto' }}>
        {list.length === 0 && 'Todavía no guardaste escenarios.'}
        {list.map((a, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #1e2f22', display: 'flex', justifyContent: 'space-between' }}>
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
