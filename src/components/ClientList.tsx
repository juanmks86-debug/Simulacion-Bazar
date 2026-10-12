import { useSim } from '../hooks/useSim'

export default function ClientList() {
  const clients = useSim((s) => s.clients)
  return (
    <div className="client-list" id="cls">
      {clients.length === 0 && <div className="sub" style={{ padding: 8 }}>Sin clientes en este instante…</div>}
      {clients.map((c) => (
        <div className="cl" key={c.id}>
          <span className="dot" style={{ background: c.color }} />
          <div className="cl-info">
            <div className="cl-name">
              {c.name} {c.icon} {c.fam} <span style={{ fontSize: 10, color: 'var(--mu)' }}>({c.profile})</span>
            </div>
            <div className="cl-sub">{c.status} {c.cart}</div>
          </div>
          <div className="cl-total">{c.total}</div>
        </div>
      ))}
    </div>
  )
}
