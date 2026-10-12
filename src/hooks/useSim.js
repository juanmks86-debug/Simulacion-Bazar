import { useSyncExternalStore } from 'react'
import { simStore } from '../sim/store.js'

// Lee una parte del estado de la simulación: const kpi = useSim((s) => s.kpi)
export function useSim(selector = (s) => s) {
  return selector(useSyncExternalStore(simStore.subscribe, simStore.getSnapshot))
}
