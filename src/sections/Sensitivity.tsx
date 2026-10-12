// Test de sensibilidad (contenido estático)
export default function Sensitivity() {
  return (
    <div className="card" id="sensibilidad">
      <h2>
        ⚖ Análisis de Sensibilidad del Soporte
      </h2>
      <div className="sub">
        Justificación de la reducción del umbral de soporte (Sección 8.2 y 10):
      </div>
      <table className="custom-table" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>
              min_support
            </th>
            <th>
              Tickets Mín.
            </th>
            <th>
              Reglas
            </th>
            <th>
              Combos 3+
            </th>
            <th>
              ¿Combo Hallado?
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              0,015 (Sensibilidad)
            </td>
            <td>
              3 de 188
            </td>
            <td>
              344
            </td>
            <td>
              11
            </td>
            <td>
              <b style={{ color: "#60c572" }}>
                Sí (Lift 3,47)
              </b>
            </td>
          </tr>
          <tr style={{ background: "#192c1f" }}>
            <td>
              <b>
                0,020 (Usado)
              </b>
            </td>
            <td>
              <b>
                4 de 188
              </b>
            </td>
            <td>
              <b>
                240
              </b>
            </td>
            <td>
              <b>
                4
              </b>
            </td>
            <td>
              <b style={{ color: "var(--gold)" }}>
                Sí (Lift 3,47)
              </b>
            </td>
          </tr>
          <tr>
            <td>
              0,030 (Original)
            </td>
            <td>
              6 de 188
            </td>
            <td>
              126
            </td>
            <td>
              0
            </td>
            <td>
              <span style={{ color: "var(--danger)" }}>
                No aparece
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
