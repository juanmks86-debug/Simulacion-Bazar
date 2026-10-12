import { useSyncExternalStore } from 'react'
import type { Store } from '../sim/createStore'

// const kpi = useStore(simStore, (s) => s.kpi)
export function useStore<T extends object, R>(store: Store<T>, selector: (s: T) => R): R {
  return selector(useSyncExternalStore(store.subscribe, store.getSnapshot))
}
