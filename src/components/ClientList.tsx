import { useState } from 'react'
import { useSim } from '../hooks/useSim'
import { money } from '../sim/calculator'

export default function ClientList() {
  const clients = useSim((s) => s.clients)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = clients.find((client) => client.id === selectedId) ?? null

  return (
    <div className="client-list-wrap">
      <div className="sub" style={{ padding: '0 4px 5px' }}>Seleccioná un cliente para consultar su perfil y decisiones.</div>
      <div className="client-list" id="cls">
        {clients.length === 0 && <div className="sub" style={{ padding: 8 }}>Sin clientes en este instante…</div>}
        {clients.map((c) => (
          <button
            type="button"
            className={`cl client-select${selectedId === c.id ? ' selected' : ''}`}
            key={c.id}
            onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
            aria-expanded={selectedId === c.id}
            aria-label={`Ver perfil de ${c.name}`}
          >
            <span className="dot" style={{ background: c.color }} />
            <span className="cl-info">
              <span className="cl-name">
                {c.name} {c.icon} {c.fam} <span style={{ fontSize: 10, color: 'var(--mu)' }}>({c.profile})</span>
              </span>
              <span className="cl-sub">{c.status} {c.cart}</span>
            </span>
            <span className="cl-total">{c.total}</span>
          </button>
        ))}
      </div>
      {selected && (
        <section className="client-detail" aria-label={`Detalle de ${selected.name}`}>
          <div className="client-detail-head">
            <strong>{selected.icon} {selected.name}</strong>
            <button type="button" className="mini-btn" onClick={() => setSelectedId(null)}>Cerrar</button>
          </div>
          <div className="client-detail-grid">
            <div><small>Presupuesto inicial</small><b>{money(selected.initialBudget)}</b></div>
            <div><small>Disponible</small><b>{money(selected.remainingBudget)}</b></div>
            <div><small>Sensibilidad al precio</small><b>{Math.round(selected.priceSensitivity * 100)}%</b></div>
            <div><small>Afinidad a promociones</small><b>{Math.round(selected.promoAffinity * 100)}%</b></div>
          </div>
          <div className="client-detail-line"><small>Preferencias:</small> {selected.preferences.join(', ') || 'Sin preferencias definidas'}</div>
          <div className="client-detail-line"><small>Modelo:</small> {selected.modelSource}</div>
          <div className="client-detail-line"><small>Confianza observada:</small> Combo {selected.comboConfidence === null ? '—' : `${Math.round(selected.comboConfidence * 100)}%`} · Canasta {selected.basketConfidence === null ? '—' : `${Math.round(selected.basketConfidence * 100)}%`}</div>
          <div className="client-detail-subtitle">Historial de compras</div>
          {selected.purchaseHistory.length ? (
            <ul className="client-history">
              {selected.purchaseHistory.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <span>{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}<small>{item.reason}</small></span>
                  <b>{money(item.paid)}</b>
                </li>
              ))}
            </ul>
          ) : <div className="sub">Todavía no realizó compras.</div>}
          {selected.decisionHistory.length > 0 && (
            <>
              <div className="client-detail-subtitle">Decisiones de compra</div>
              <ul className="client-history decisions">
                {selected.decisionHistory.slice(-5).reverse().map((item, index) => (
                  <li key={`${item.product}-${index}`}><span>{item.product}<small>{item.reason}</small></span><b>{item.bought ? 'Compró' : 'No compró'}</b></li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}
