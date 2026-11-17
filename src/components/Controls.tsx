import { useSim } from '../hooks/useSim'
import { useStore } from '../hooks/useStore'
import { controller } from '../sim/controller'
import { paramsStore, setParam, type PromoChoice } from '../sim/params'

interface SliderProps { label: string; id: 'sL' | 'sC' | 'sB' | 'sS'; valId: string; unit: string; min: number; max: number; step?: number; fmt?: (n: number) => string }

function Slider({ label, id, valId, unit, min, max, step = 1, fmt = String }: SliderProps) {
  const v = useStore(paramsStore, (p) => p[id])
  return (
    <div className="ctrl-row">
      <div className="ctrl-label">{label}<b><span id={valId}>{fmt(v)}</span>{unit}</b></div>
      <input id={id} type="range" min={min} max={max} step={step} value={v} onChange={(e) => setParam(id, Number(e.target.value))} />
    </div>
  )
}

export default function Controls() {
  const promo = useStore(paramsStore, (p) => p.sP)
  const sound = useSim((s) => s.sound)
  return (
    <div className="card" id="controles" style={{ marginBottom: 14 }}>
      <h2>Control del Flujo Comercial</h2>
      <div className="btns-group">
        <button className="btn btn-secondary" id="so" onClick={() => controller.toggleSound()}>
          🔊 Sonido: {sound ? 'SÍ' : 'NO'}
        </button>
        <select
          id="sP"
          value={promo}
          onChange={(e) => setParam('sP', e.target.value as PromoChoice)}
          className="control-select"
        >
          <option value="auto">Promoción: Automática por horario</option>
          <option value="tazas">2x1 en Tazas de café (Mañana)</option>
          <option value="mantel">20% OFF Mantel de lino (Mediodía)</option>
          <option value="vela">30% OFF Vela aromática (Tarde)</option>
          <option value="none">Sin promoción activa</option>
        </select>
      </div>
      <Slider label="Llegada de clientes (Poisson)" id="sL" valId="vL" unit=" clientes/min" min={1} max={10} />
      <Slider label="Probabilidad formar antecedente combo" id="sC" valId="vC" unit="%" min={5} max={100} step={0.1} fmt={(n) => n.toFixed(1)} />
      <Slider label="Probabilidad sumar Canasta de Mimbre" id="sB" valId="vB" unit="%" min={0} max={100} />
      <Slider label="Velocidad de simulación" id="sS" valId="vS" unit="x" min={0.5} max={3} step={0.1} fmt={(n) => n.toFixed(1)} />
    </div>
  )
}
