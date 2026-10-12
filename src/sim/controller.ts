import type { CameraName } from './store'

/* Puente React → motor. El motor registra sus acciones al iniciar; la interfaz las llama desde botones y atajos. */
export interface SimActions {
  isRunning: () => boolean
  setRunning: (v: boolean) => void
  reset: () => void
  toggleSound: () => void
  setCamera: (c: CameraName) => void
  exportCsv: () => void
  toggleFullscreen: () => void
  saveScenario: () => void
  clearLog: () => void
}

let impl: Partial<SimActions> = {}

export const controller = {
  register(actions: SimActions) { impl = actions },
  unregister() { impl = {} },
  isRunning: () => impl.isRunning?.() ?? false,
  setRunning: (v: boolean) => impl.setRunning?.(v),
  reset: () => impl.reset?.(),
  toggleSound: () => impl.toggleSound?.(),
  setCamera: (c: CameraName) => impl.setCamera?.(c),
  exportCsv: () => impl.exportCsv?.(),
  toggleFullscreen: () => impl.toggleFullscreen?.(),
  saveScenario: () => impl.saveScenario?.(),
  clearLog: () => impl.clearLog?.(),
}
