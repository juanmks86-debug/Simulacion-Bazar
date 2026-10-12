// Bootstrap (contenido estático)
export default function Bootstrap() {
  return (
    <div className="card" id="bootstrap">
      <div className="eyebrow">
        Validación de Respaldo Estadístico · Sección 10.1
      </div>
      <h2>
        🧪 Validación de Estabilidad por Remuestreo (Bootstrap 500 Iteraciones)
      </h2>
      <div className="sub">
        Evaluación empírica para responder: ¿Qué tan sensible es la regla ganadora a la muestra específica de 188 tickets?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px", marginTop: "10px" }}>
        <div className="mc-kpi">
          <small>
            Frecuencia con min_support = 0.02
          </small>
          {' '}
          <b style={{ color: "var(--warning)" }}>
            56,4%
          </b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>
            Aparece en 282 de 500 muestras
          </span>
        </div>
        <div className="mc-kpi">
          <small>
            Lift Medio Bootstrap
          </small>
          {' '}
          <b>
            3,49
            {' '}
            <span style={{ fontSize: "11px", color: "var(--mu)" }}>
              (± 1,33)
            </span>
          </b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>
            Observado original: 3,47
          </span>
        </div>
        <div className="mc-kpi">
          <small>
            Intervalo Lift (P5 – P95)
          </small>
          {' '}
          <b style={{ color: "var(--gold)" }}>
            [1,45 ; 5,88]
          </b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>
            {"Siempre > 1, pero oscila"}
          </span>
        </div>
        <div className="mc-kpi">
          <small>
            Confianza Media Bootstrap
          </small>
          {' '}
          <b>
            56,8%
            {' '}
            <span style={{ fontSize: "11px", color: "var(--mu)" }}>
              (± 21,0%)
            </span>
          </b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>
            Observado original: 57,1%
          </span>
        </div>
      </div>
    </div>
  )
}
