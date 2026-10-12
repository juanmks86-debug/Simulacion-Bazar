import { useSim } from '../hooks/useSim.js'

export default function EventLog() {
  const log = useSim((s) => s.log)
  return log.map((l, i) => (
    <div key={`${l.t}-${i}`}>
      <span>{l.t}</span>
      <span>{l.m}</span>
      <span>{l.v}</span>
    </div>
  ))
}
