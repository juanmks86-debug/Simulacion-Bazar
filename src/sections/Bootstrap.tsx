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
            {"Baja de 1 en 13 de 500 muestras"}
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
              (± 20,9%)
            </span>
          </b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>
            Observado original: 57,1%
          </span>
        </div>
      </div>
      <h3 style={{ color: "#fff", fontSize: "12px", margin: "16px 0 4px" }}>
        🎲 Estabilidad frente a otras semillas del generador (Sección 10.1.3)
      </h3>
      <div className="sub">
        Se repitió todo el pipeline (generación, limpieza, Apriori con min_support = 0,02 y filtro de combos 3+) con 200 semillas. El generador sortea los productos de forma independiente: cualquier combo es una coincidencia muestral.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px", marginTop: "10px" }}>
        <div className="mc-kpi">
          <small>Semillas con algún combo 3+</small>
          {' '}
          <b style={{ color: "var(--warning)" }}>78,5%</b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>Lift &gt; 1, alta rotación → estancado</span>
        </div>
        <div className="mc-kpi">
          <small>Reaparece el combo exacto</small>
          {' '}
          <b style={{ color: "var(--danger)" }}>5,0%</b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>Platos + Servilletero + Tazas → Canasta</span>
        </div>
        <div className="mc-kpi">
          <small>Mejor lift: mediana (P10 – P90)</small>
          {' '}
          <b>2,61 <span style={{ fontSize: "11px", color: "var(--mu)" }}>(1,95 – 3,48)</span></b>
        </div>
        <div className="mc-kpi">
          <small>Lift de la semilla 42 (3,47)</small>
          {' '}
          <b style={{ color: "var(--gold)" }}>Percentil 89</b>
          {' '}
          <span style={{ fontSize: "10px", color: "var(--mu)", display: "block" }}>Alto, pero no excepcional frente al azar</span>
        </div>
      </div>
    </div>
  )
}
