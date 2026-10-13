import { beforeEach, describe, expect, it } from 'vitest'
import { goSlide, presentationStore, slidesFor, startPresentation, stopPresentation, toggleNotes } from '../src/sim/presentation'

describe('guion de la presentación', () => {
  it('incluye la diapositiva de datos reales solo si hay datos', () => {
    const sin = slidesFor(false), con = slidesFor(true)
    expect(con).toHaveLength(sin.length + 1)
    expect(sin.some((s) => s.path === '/datos')).toBe(false)
    expect(con.some((s) => s.path === '/datos')).toBe(true)
  })
  it('todas las diapositivas tienen ruta, título y notas', () => {
    for (const s of slidesFor(true)) { expect(s.path.startsWith('/')).toBe(true); expect(s.title).toBeTruthy(); expect(s.notes.length).toBeGreaterThan(0) }
  })
})

describe('estado de la presentación', () => {
  beforeEach(() => { stopPresentation(); presentationStore.publish({ index: 0, notes: true }) })
  it('arranca en la primera, no se sale de los límites y alterna notas', () => {
    startPresentation()
    expect(presentationStore.getSnapshot()).toMatchObject({ active: true, index: 0 })
    goSlide(-3, 5); expect(presentationStore.getSnapshot().index).toBe(0)
    goSlide(99, 5); expect(presentationStore.getSnapshot().index).toBe(4)
    toggleNotes(); expect(presentationStore.getSnapshot().notes).toBe(false)
    stopPresentation(); expect(presentationStore.getSnapshot().active).toBe(false)
  })
})
