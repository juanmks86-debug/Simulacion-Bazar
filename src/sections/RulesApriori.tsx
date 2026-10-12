// Reglas Apriori (contenido estático)
export default function RulesApriori() {
  return (
    <div className="card" id="reglas">
      <h2>
        ⌘ Reglas de Asociación Apriori (Métricas Completas)
      </h2>
      <div className="eyebrow">
        Regla Principal: Pack Mesa Completa (4 ítems en total)
      </div>
      <div className="ruleflow">
        <span className="chip">
          Platos Londres
        </span>
        {' '}
        <span className="chip">
          Servilletero
        </span>
        {' '}
        <span className="chip">
          Tazas de café
        </span>
        {' '}
        <span className="arrow">
          ➜
        </span>
        {' '}
        <span className="chip chip-target">
          🧺 Canasta de mimbre
        </span>
      </div>
      <div className="metrics5">
        <div className="metricbox">
          <span>
            Soporte
          </span>
          <strong>
            2,13%
          </strong>
          <small style={{ fontSize: "9px", color: "var(--mu)" }}>
            4/188 tickets
          </small>
        </div>
        <div className="metricbox">
          <span>
            Confianza
          </span>
          <strong style={{ color: "#72d98c" }}>
            57,1%
          </strong>
          <small style={{ fontSize: "9px", color: "var(--mu)" }}>
            P(Y|X)
          </small>
        </div>
        <div className="metricbox">
          <span>
            Lift
          </span>
          <strong style={{ color: "var(--gold)" }}>
            3,47×
          </strong>
          <small style={{ fontSize: "9px", color: "var(--mu)" }}>
            Fuerza
          </small>
        </div>
        <div className="metricbox">
          <span>
            Leverage
          </span>
          <strong style={{ color: "#72b2e8" }}>
            0,0151
          </strong>
          <small style={{ fontSize: "9px", color: "var(--mu)" }}>
            1,5% peso vol.
          </small>
        </div>
        <div className="metricbox">
          <span>
            Conviction
          </span>
          <strong style={{ color: "#e09b3d" }}>
            1,95
          </strong>
          <small style={{ fontSize: "9px", color: "var(--mu)" }}>
            Asimetría
          </small>
        </div>
      </div>
    </div>
  )
}
