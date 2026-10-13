import { P } from './catalog'

/**
 * CSV de EJEMPLO SINTÉTICO (no son ventas reales): sirve para ver cómo funciona la página de datos
 * y para descargar una plantilla con el formato esperado. Reproducible (semilla fija).
 */
export function sampleCsv(tickets = 220, seed = 20260801): string {
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]
  const rows: string[] = ['ticket,fecha,producto,cantidad,precio']
  const others = ['vasos', 'cubiertos', 'mantel', 'vela', 'retrato', 'adorno']
  for (let t = 1; t <= tickets; t++) {
    const id = `T${String(t).padStart(4, '0')}`
    const day = 1 + Math.floor((t - 1) / (tickets / 30))
    const fecha = `2026-08-${String(Math.min(day, 30)).padStart(2, '0')}`
    const items: string[] = []
    if (rand() < 0.35) {
      items.push('platos')
      if (rand() < 0.57) {
        items.push('tazas', 'servilletero')
        if (rand() < 0.35) items.push('canasta')
      } else if (rand() < 0.3) items.push(pick(others))
    } else {
      items.push(pick([...others, 'tazas', 'servilletero', 'canasta']))
      if (rand() < 0.2) items.push(pick(others))
    }
    for (const k of new Set(items)) rows.push(`${id},${fecha},${P[k].n},1,${P[k].p}`)
  }
  return rows.join('\n') + '\n'
}
