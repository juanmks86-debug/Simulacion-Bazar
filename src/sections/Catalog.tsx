import CatalogRows from '../components/CatalogRows'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'

export default function Catalog() {
  const { products, data } = useDynamicCatalog()
  const high = products.filter((p) => p.rot === 'Alta').length
  const low = products.length - high
  return (
    <div className="card" id="productos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2>▤ Catálogo dinámico de productos</h2>
        <span className="sub">{products.length} productos · {high} alta rotación / {low} menor rotación</span>
      </div>
      <div className="sub" style={{ marginBottom: 10 }}>{data.fileName ? `Fuente: ${data.fileName}. Precio de venta tomado del registro más reciente disponible por producto. Costo inicial estimado al 55% del precio.` : 'El catálogo se genera al cargar un CSV.'}</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead><tr><th>Ítem</th><th>Producto</th><th>Rotación</th><th>Precio CSV</th><th>Costo editable</th><th>Margen editable</th><th>Rol</th><th>Origen</th></tr></thead>
          <tbody id="catalogTbody"><CatalogRows /></tbody>
        </table>
      </div>
    </div>
  )
}
