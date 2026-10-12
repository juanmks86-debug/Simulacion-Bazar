import { useStore } from './useStore'
import { simStore, type SimState } from '../sim/store'

// Lee una parte del estado de la simulación: const kpi = useSim((s) => s.kpi)
export function useSim<R>(selector: (s: SimState) => R): R {
  return useStore(simStore, selector)
}
