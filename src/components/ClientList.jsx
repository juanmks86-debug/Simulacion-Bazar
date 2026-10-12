import { useSim } from '../hooks/useSim.js'

export default function ClientList() {
  const clients = useSim((s) => s.clients)
  if (!clients.length) return <div className="sub" style={{ padding: 8 }}>Sin clientes en este instante…</div>
  return clients.map((c) => (
    <div className="cl" key={c.id}>
      <span className="dot" style={{ background: c.color }} />
      <div className="cl-info">
        <div className="cl-name">
          {c.name} {c.icon} {c.fam}{' '}
          <span style={{ fontSize: 10, color: 'var(--mu)' }}>({c.profile})</span>
        </div>
        <div className="cl-sub">{c.status} {c.cart}</div>
      </div>
      <div className="cl-total">{c.total}</div>
    </div>
  ))
}
