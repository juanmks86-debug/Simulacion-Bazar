import { createStore } from './createStore'
import { parseSales, type Sale } from './salesData'

export interface DataState { fileName: string | null; sales: Sale[]; warnings: string[]; error: string | null; synthetic: boolean }

const KEY = 'bazar:sales'
const MAX_SAVED = 1_500_000 // caracteres: más que eso no se guarda en el navegador

export const dataStore = createStore<DataState>({ fileName: null, sales: [], warnings: [], error: null, synthetic: false })

/** Lee un CSV, actualiza el almacén y lo guarda en el navegador (si es chico). Devuelve true si se pudo leer. */
export function loadCsvText(text: string, fileName: string, synthetic = false): boolean {
  try {
    const { sales, warnings } = parseSales(text)
    dataStore.publish({ fileName, sales, warnings, error: null, synthetic })
    try {
      if (text.length <= MAX_SAVED) localStorage.setItem(KEY, JSON.stringify({ text, fileName, synthetic }))
      else localStorage.removeItem(KEY) // No restaurar un CSV anterior como si fuera el último cargado.
    } catch {
      // Si no se puede persistir el archivo nuevo, eliminar cualquier copia vieja para evitar restaurarla por error.
      try { localStorage.removeItem(KEY) } catch { /* sin almacenamiento disponible */ }
    }
    return true
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'No se pudo leer el archivo.'
    const activeFile = dataStore.getSnapshot().fileName
    dataStore.publish({ error: activeFile ? `${reason} Se conservan los datos válidos del archivo «${activeFile}».` : reason })
    return false
  }
}

export function clearData() {
  dataStore.publish({ fileName: null, sales: [], warnings: [], error: null, synthetic: false })
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
}

/** Recupera el último CSV guardado (al abrir la página). */
export function restoreData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (typeof saved?.text !== 'string' || !saved.text || !loadCsvText(saved.text, saved.fileName ?? 'datos.csv', !!saved.synthetic)) {
      localStorage.removeItem(KEY)
    }
  } catch {
    try { localStorage.removeItem(KEY) } catch { /* noop */ }
  }
}
restoreData()
