/* Almacén reactivo mínimo, compatible con useSyncExternalStore. */
export interface Store<T> {
  getSnapshot: () => T
  subscribe: (fn: () => void) => () => void
  publish: (partial: Partial<T>) => void
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => state,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    publish(partial) {
      state = { ...state, ...partial }
      listeners.forEach((fn) => fn())
    },
  }
}
