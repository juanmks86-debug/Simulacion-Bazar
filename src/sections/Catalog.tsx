import CatalogRows from '../components/CatalogRows'

// Catálogo de productos y precios reales
export default function Catalog() {
  return (
    <div className="card" id="productos">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          ▤ Catálogo de Productos y Precios Reales (Perico, Agosto 2026)
        </h2>
        <span className="sub">
          10 productos · 5 alta rotación / 5 estancados
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>
                Ítem
              </th>
              <th>
                Nombre Comercial
              </th>
              <th>
                Rotación
              </th>
              <th>
                PVP Real
              </th>
              <th>
                Costo Deducido
              </th>
              <th>
                Margen Base
              </th>
              <th>
                Rol en Estrategia
              </th>
            </tr>
          </thead>
          <tbody id="catalogTbody"><CatalogRows /></tbody>
        </table>
      </div>
    </div>
  )
}
