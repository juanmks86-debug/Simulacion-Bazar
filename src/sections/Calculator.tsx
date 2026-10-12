import { useState } from 'react'
import { comboCalc, money } from '../sim/calculator'

// Verificación financiera del Pack Mesa (Sección 8.4): el slider cambia el descuento de la canasta.
export default function Calculator() {
  const [desc, setDesc] = useState(15)
  const c = comboCalc(desc)
  return (
    <div className="card" id="calculadora">
      <div className="eyebrow">Verificación Financiera Rigurosa · Sección 8.4</div>
      <h2>🧮 Definiciones Financieras y Verificación de Margen</h2>
      <div className="calc-grid">
        <div>
          <div className="ctrl-row">
            <div className="ctrl-label">Descuento aplicado en Canasta de Mimbre: <b><span id="calcDescVal">{desc}</span>%</b></div>
            <input id="calcDescRange" type="range" min={5} max={35} step={1} value={desc} onChange={(e) => setDesc(Number(e.target.value))} />
          </div>
          <table className="custom-table" style={{ marginTop: "12px" }}>
            <thead>
              <tr>
                <th>
                  Ítem
                </th>
                <th>
                  PVP Regular
                </th>
                <th>
                  Costo Real
                </th>
                <th>
                  PVP en Combo
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Platos Londres (Alta)
                </td>
                <td>
                  $ 14.000
                </td>
                <td>
                  $ 8.400
                </td>
                <td>
                  $ 14.000
                </td>
              </tr>
              <tr>
                <td>
                  Servilletero (Alta)
                </td>
                <td>
                  $ 2.000
                </td>
                <td>
                  $ 1.200
                </td>
                <td>
                  $ 2.000
                </td>
              </tr>
              <tr>
                <td>
                  Tazas de café (Alta)
                </td>
                <td>
                  $ 2.000
                </td>
                <td>
                  $ 1.200
                </td>
                <td>
                  $ 2.000
                </td>
              </tr>
              <tr>
                <td>
                  Canasta de mimbre (Estancada)
                </td>
                <td>
                  $ 35.000
                </td>
                <td>
                  $ 14.000
                </td>
                <td id="calcCanastaPVP" style={{ color: "var(--gold)", fontWeight: "bold" }}>{money(c.pvpCanastaCombo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="calc-result-box">
          <h3>Glosario de Términos (Devolución Docente)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <div className="mc-kpi"><small>PVP Regular Total</small><b id="calcPvpReg">{money(c.pvpRegularTotal)}</b></div>
            <div className="mc-kpi"><small>PVP Final Combo</small><b id="calcPvpCombo" style={{ color: 'var(--gold)' }}>{money(c.pvpCombo)}</b></div>
            <div className="mc-kpi"><small>Costo de Reposición</small><b id="calcCostoTot">{money(c.costoTotal)}</b></div>
            <div className="mc-kpi"><small>Ahorro del Cliente</small><b id="calcAhorro" style={{ color: '#70bcf5' }}>{money(c.ahorro)}</b></div>
            <div className="mc-kpi"><small>Margen Sin Combo</small><b id="calcMargenSin">{c.margenSin.toFixed(1)}%</b></div>
            <div className="mc-kpi"><small>Margen Con Combo</small><b id="calcMargenCon" style={{ color: '#60c572' }}>{c.margenCon.toFixed(1)}%</b></div>
          </div>
          <div className="sub" id="calcConclusion" style={{ marginTop: 10 }}>
            Caída de margen bruto porcentual: <b style={{ color: 'var(--gold)' }}>-{c.perdidaPP.toFixed(1)} puntos porcentuales (pp)</b>. Margen resultante:{' '}
            <b style={{ color: '#60c572' }}>{c.margenCon.toFixed(1)}%</b>. Ahorro para el cliente: <b>{money(c.ahorro)}</b>.
          </div>
        </div>
      </div>
    </div>
  )
}
