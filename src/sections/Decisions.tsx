import { useMemo, useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { buildCommercialOpportunities } from '../sim/commercial'
import { money } from '../sim/calculator'
import { useDynamicCatalog } from '../hooks/useDynamicCatalog'

const pct = (n: number) => `${(n * 100).toFixed(1).replace('.', ',')}%`

function exportCsv(rows: ReturnType<typeof buildCommercialOpportunities>) {
  const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = [
    ['Combo', 'Soporte', 'Confianza', 'Lift', 'Tickets', 'Precio regular', 'Costo', 'Margen sin descuento', 'Descuento sugerido', 'Margen con descuento'].map(quote).join(';'),
    ...rows.map((r) => [r.products.map((p) => p.n).join(' + '), pct(r.support), pct(r.confidence), r.lift.toFixed(2), r.count, r.revenue, r.cost, pct(r.margin), pct(r.suggestedDiscount), pct(r.marginAtSuggestion)].map(quote).join(';')),
  ]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = 'oportunidades_comerciales.csv'; a.click(); URL.revokeObjectURL(url)
}

export default function Decisions() {
  const [targetMargin, setTargetMargin] = useState(35)
  const [discountCap, setDiscountCap] = useState(15)
  const { data, analysis } = useAnalysis(0.01, 0.2)
  const { products } = useDynamicCatalog()
  const opportunities = useMemo(
    () => buildCommercialOpportunities(analysis?.rules ?? [], targetMargin / 100, discountCap / 100, products, analysis?.baskets ?? []),
    [analysis?.rules, analysis?.baskets, products, targetMargin, discountCap],
  )

  return (
    <div className="card" id="decisiones">
      <div className="eyebrow">Fase 4 · Despliegue y decisión comercial</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><h2>🎯 Laboratorio de Decisiones Comerciales</h2><div className="sub">Transforma asociaciones observadas en combos evaluados por su economía unitaria.</div></div>
        <button className="btn btn-gold no-print" disabled={!opportunities.length} onClick={() => exportCsv(opportunities)}>⇩ Exportar evaluación CSV</button>
      </div>

      <div className="sub" style={{ marginTop: 10 }}>
        Fuente: <b>{data.fileName ?? 'sin dataset cargado'}</b>{data.synthetic ? ' · dataset sintético de ejemplo' : data.sales.length ? ' · dataset cargado por el usuario' : ''}. Los combos se derivan de reglas con soporte mínimo 1% y confianza mínima 20%.
      </div>

      <div className="mc-stats" style={{ marginTop: 12 }}>
        <div className="mc-kpi"><small>Tickets analizados</small><b>{analysis?.summary.tickets ?? 0}</b></div>
        <div className="mc-kpi"><small>Reglas evaluadas</small><b>{analysis?.rules.length ?? 0}</b></div>
        <div className="mc-kpi"><small>Oportunidades económicas</small><b>{opportunities.length}</b></div>
        <div className="mc-kpi"><small>Margen objetivo</small><b>{targetMargin}%</b></div>
      </div>

      <div className="calc-grid" style={{ marginTop: 14 }}>
        <div className="ctrl-row"><div className="ctrl-label">Margen bruto mínimo buscado: <b>{targetMargin}%</b></div><input aria-label="Margen bruto mínimo" type="range" min={20} max={65} step={1} value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))} /></div>
        <div className="ctrl-row"><div className="ctrl-label">Tope de descuento propuesto: <b>{discountCap}%</b></div><input aria-label="Tope de descuento" type="range" min={0} max={35} step={1} value={discountCap} onChange={(e) => setDiscountCap(Number(e.target.value))} /></div>
      </div>

      {!analysis && <div className="sub" style={{ marginTop: 14 }}>Cargá un archivo en <b>Datos reales (CSV)</b> o utilizá el ejemplo sintético para descubrir oportunidades.</div>}
      {analysis && !opportunities.length && <div className="sub" style={{ marginTop: 14 }}>No hay productos con precios válidos suficientes para evaluar oportunidades económicas. Revisá la columna precio del CSV.</div>}

      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {opportunities.map((o, index) => (
          <article key={o.products.map((p) => p.id).sort().join('-')} style={{ border: '1px solid var(--bd)', borderRadius: 10, padding: 12, background: 'var(--card-alt)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div><b style={{ color: 'var(--gold)' }}>#{index + 1} · {o.products.map((p) => `${p.e} ${p.n}`).join(' + ')}</b><div className="sub">{o.source === 'association' ? 'Regla de asociación observada' : o.source === 'cooccurrence' ? 'Coaparición observada (exploratoria)' : 'Evaluación económica individual (sin asociación)'} · {o.count} tickets · soporte {pct(o.support)} · confianza {pct(o.confidence)} · lift {o.lift.toFixed(2).replace('.', ',')}×</div></div>
              <div style={{ textAlign: 'right' }}><small className="sub">Precio regular conjunto</small><div><b>{money(o.revenue)}</b></div></div>
            </div>
            <div className="mc-stats" style={{ marginTop: 10 }}>
              <div className="mc-kpi"><small>Costo conjunto</small><b>{money(o.cost)}</b></div>
              <div className="mc-kpi"><small>Margen sin descuento</small><b>{pct(o.margin)}</b></div>
              <div className="mc-kpi"><small>Máximo descuento seguro</small><b>{pct(o.maxSafeDiscount)}</b></div>
              <div className="mc-kpi"><small>Propuesta / margen final</small><b>{pct(o.suggestedDiscount)} / {pct(o.marginAtSuggestion)}</b></div>
            </div>
            <div className="sub" style={{ marginTop: 8 }}>{o.targetMarginFeasible ? 'El descuento propuesto respeta el margen objetivo configurado.' : 'El margen objetivo no es alcanzable ni siquiera sin descuento: habría que revisar precio o costo.'} Evaluación basada en precios y costos del CSV; no implica que la promoción vaya a aumentar las ventas.</div>
          </article>
        ))}
      </div>
      <div className="sub" style={{ marginTop: 12, borderTop: '1px solid var(--bd)', paddingTop: 10 }}><b>Cómo interpretar:</b> lift superior a 1 indica asociación positiva en los tickets observados, no causalidad. La evaluación financiera supone vender todos los artículos del combo al precio de catálogo y aplicar el descuento al total del combo. Verificá precios, costos y stock antes de ejecutar una promoción.</div>
    </div>
  )
}
