/* Almacén mínimo de estado visible (compatible con useSyncExternalStore).
   El motor publica cada ~150 ms; los componentes React solo se suscriben y dibujan. */
let snapshot = {
  kpi: { revenue: '$ 0', margin: '$ 0', sales: 0, combo: 0, basket: 0, conversion: '0.0', marginPct: '0.0' },
  clients: [],
  log: [],
  units: {},
};
const listeners = new Set();

export const simStore = {
  getSnapshot: () => snapshot,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  publish(partial) {
    snapshot = { ...snapshot, ...partial };
    listeners.forEach((fn) => fn());
  },
};
