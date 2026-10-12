import { createStore } from './createStore'

export interface Kpi { revenue: string; margin: string; sales: number; combo: number; basket: number; conversion: string; marginPct: string }
export interface ClientRow { id: number; name: string; icon: string; fam: string; profile: string; color: string; status: string; cart: string; total: string }
export interface LogRow { t: string; m: string; v: string }
export interface Scenario { promo: string; comboProb: number; basketProb: number; visits: number; sales: number; revenue: number; margin: number; combos: number }
export interface Inspector { title: string; badge: string; high: boolean; pvp: string; costo: string; stock: number; cap: number; rol: string }
export type CameraName = 'general' | 'combo' | 'caja'

export interface SimState {
  kpi: Kpi
  clients: ClientRow[]
  log: LogRow[]
  units: Record<string, number>
  clock: string
  icon: string
  period: string
  promoText: string
  running: boolean
  sound: boolean
  camera: CameraName
  inspector: Inspector | null
  scenarios: Scenario[]
}

/* Estado visible que publica el motor (~cada 150 ms). Los componentes React solo se suscriben y dibujan. */
export const simStore = createStore<SimState>({
  kpi: { revenue: '$ 0', margin: '$ 0', sales: 0, combo: 0, basket: 0, conversion: '0.0', marginPct: '0.0' },
  clients: [],
  log: [],
  units: {},
  clock: '11:30',
  icon: '☀️',
  period: 'Tarde',
  promoText: 'ninguna',
  running: true,
  sound: false,
  camera: 'general',
  inspector: null,
  scenarios: [],
})
