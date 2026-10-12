import { useSim } from '../hooks/useSim.js'

// Indicadores principales. Los ids se mantienen porque los usan los tests y estilos.
export default function Kpis() {
  const k = useSim((s) => s.kpi)
  const cards = [
    { cls: 'kpi-gold',  label: 'Facturación Simulada',  id: 'kRevenue', value: k.revenue, hint: 'Ingreso bruto en caja' },
    { cls: 'kpi-green', label: 'Margen Bruto Real',     id: 'kMargin',  value: k.margin,  hint: `Margen medio: ${k.marginPct}%`, hintId: 'kMarginPct' },
    { cls: 'kpi-blue',  label: 'Tickets Cobrados',      id: 'kSales',   value: k.sales,   hint: `Conversión: ${k.conversion}%`, hintId: 'kConversion' },
    { cls: 'kpi-gold',  label: 'Combos Pack Mesa',      id: 'kCombo',   value: k.combo,   hint: 'Antecedentes + Canasta' },
    { cls: '',          label: 'Canastas con 15% OFF',  id: 'kBasket',  value: k.basket,  hint: 'Salida de stock estancado' },
  ]
  return cards.map((c) => (
    <div key={c.id} className={`card kpi ${c.cls}`.trim()}>
      <div className="klabel">{c.label}</div>
      <div className="kvalue" id={c.id}>{c.value}</div>
      <div className="khint" id={c.hintId}>{c.hint}</div>
    </div>
  ))
}
