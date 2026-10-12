import { createStore } from './createStore'

export type PromoChoice = 'auto' | 'tazas' | 'mantel' | 'vela' | 'none'
export interface Params {
  sL: number // llegada de clientes (por minuto)
  sC: number // probabilidad de formar el antecedente del combo (%)
  sB: number // probabilidad de sumar la canasta (%)
  sS: number // velocidad de simulación
  sP: PromoChoice
}

export const DEFAULT_PARAMS: Params = { sL: 4, sC: 57.1, sB: 35, sS: 1, sP: 'auto' }
export const PARAM_KEY = 'bazar:params'
const PROMOS: PromoChoice[] = ['auto', 'tazas', 'mantel', 'vela', 'none']
const LIMITS: Record<'sL' | 'sC' | 'sB' | 'sS', [number, number]> = { sL: [1, 10], sC: [5, 100], sB: [0, 100], sS: [0.5, 3] }

/** Lee y valida lo guardado en el navegador; lo inválido se reemplaza por el valor por defecto. */
export function loadParams(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Params {
  const out = { ...DEFAULT_PARAMS }
  try {
    const saved = JSON.parse(storage?.getItem(PARAM_KEY) || '{}')
    for (const k of ['sL', 'sC', 'sB', 'sS'] as const) {
      const n = Number(saved[k])
      const [lo, hi] = LIMITS[k]
      if (saved[k] != null && Number.isFinite(n) && n >= lo && n <= hi) out[k] = n
    }
    if (PROMOS.includes(saved.sP)) out.sP = saved.sP
  } catch { /* storage no disponible o JSON inválido */ }
  return out
}

export const paramsStore = createStore<Params>(loadParams())
export const getParams = () => paramsStore.getSnapshot()

export function setParam<K extends keyof Params>(key: K, value: Params[K]) {
  paramsStore.publish({ [key]: value } as Partial<Params>)
  try { localStorage.setItem(PARAM_KEY, JSON.stringify(getParams())) } catch { /* noop */ }
}
