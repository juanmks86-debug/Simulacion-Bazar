import { useState } from 'react'
import { crispData } from '../sim/catalog'

const NAMES = ['Business Underst.', 'Data Underst.', 'Data Prep.', 'Modeling', 'Evaluation', 'Deployment']

// Fases de CRISP-DM: al elegir una fase se muestra su detalle
export default function Crisp() {
  const [idx, setIdx] = useState(0)
  return (
    <div className="card" id="crisp">
      <div className="eyebrow">Marco Metodológico Formal · Sección 2.5</div>
      <h2>🔄 Fases de CRISP-DM Mapeadas en el Informe</h2>
      <div className="crisp-steps">
        {NAMES.map((n, i) => (
          <div key={n} className={`crisp-step${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)}>
            <div className="crisp-num">{i + 1}</div>
            <div className="crisp-name">{n}</div>
          </div>
        ))}
      </div>
      <div className="card" id="crispDetail" style={{ marginTop: 10, background: '#0d1711', borderColor: '#263a2b' }}>
        <h3 id="crispTitle">{crispData[idx].t}</h3>
        <p className="sub" id="crispText" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>{crispData[idx].d}</p>
      </div>
    </div>
  )
}
