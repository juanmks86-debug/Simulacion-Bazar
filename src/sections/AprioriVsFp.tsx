// Apriori vs FP-Growth (contenido estático)
export default function AprioriVsFp() {
  return (
    <div className="card" id="apriori-fp">
      <h2>
        ⚖ Justificación: ¿Por qué Apriori y no FP-Growth?
      </h2>
      <div className="sub">
        Anticipación a la pregunta clásica de defensa oral (Sección 8.2.1):
      </div>
      <table className="custom-table" style={{ marginTop: "8px" }}>
        <thead>
          <tr>
            <th>
              Criterio
            </th>
            <th>
              Apriori
            </th>
            <th>
              FP-Growth
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Enfoque
            </td>
            <td>
              Generación de candidatos y poda de soporte.
            </td>
            <td>
              Árbol de prefijos (FP-tree).
            </td>
          </tr>
          <tr>
            <td>
              Escaneos
            </td>
            <td>
              Múltiples escaneos de transacciones.
            </td>
            <td>
              Solo 2 escaneos completos.
            </td>
          </tr>
          <tr>
            <td>
              Transparencia didáctica
            </td>
            <td>
              <b style={{ color: "var(--gold)" }}>
                Alta (fácil de documentar paso a paso).
              </b>
            </td>
            <td>
              Menor (más abstracto para exponer).
            </td>
          </tr>
          <tr>
            <td>
              Catálogo acotado
            </td>
            <td>
              <b>
                Óptimo (10 productos, 188 tickets).
              </b>
            </td>
            <td>
              Ventaja de velocidad imperceptible.
            </td>
          </tr>
          <tr>
            <td>
              Resultado matemático
            </td>
            <td>
              <b>
                Idéntico para el mismo soporte.
              </b>
            </td>
            <td>
              Idéntico.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
