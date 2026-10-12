// Plan de prueba piloto (contenido estático)
export default function Pilot() {
  return (
    <div className="card" id="piloto">
      <h2>
        🚀 Plan de Prueba Piloto con Datos Reales (Sección 11.6)
      </h2>
      <div className="sub">
        Esquema controlado de 2 a 4 semanas previo al despliegue masivo:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
        <div className="mc-kpi" style={{ textAlign: "left" }}>
          <small>
            KPI 1: Rotación Canasta
          </small>
          <b>
            Unidades / sem
          </b>
          <span className="sub">
            Combo + suelta vs histórico.
          </span>
        </div>
        <div className="mc-kpi" style={{ textAlign: "left" }}>
          <small>
            KPI 2: Ticket Promedio
          </small>
          <b>
            $ por compra
          </b>
          <span className="sub">
            Venta neta adicional.
          </span>
        </div>
        <div className="mc-kpi" style={{ textAlign: "left" }}>
          <small>
            KPI 3: Margen Bruto Real
          </small>
          <b>
            $ efectivo
          </b>
          <span className="sub">
            Verificar margen 48,1%.
          </span>
        </div>
        <div className="mc-kpi" style={{ textAlign: "left" }}>
          <small>
            KPI 4: Tasa Adopción
          </small>
          <b>
            % Combo
          </b>
          <span className="sub">
            Verificar demanda 3x-6x.
          </span>
        </div>
      </div>
    </div>
  )
}
