import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore } from '../src/sim/createStore'
import { DEFAULT_PARAMS, PARAM_KEY, getParams, loadParams, paramsStore, setParam } from '../src/sim/params'
import { controller } from '../src/sim/controller'

describe('createStore', () => {
  it('notifica a los suscriptores y permite darse de baja', () => {
    const s = createStore({ n: 1, m: 'a' })
    const fn = vi.fn()
    const off = s.subscribe(fn)
    s.publish({ n: 2 })
    expect(s.getSnapshot()).toEqual({ n: 2, m: 'a' })
    expect(fn).toHaveBeenCalledTimes(1)
    off()
    s.publish({ n: 3 })
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('parámetros guardados', () => {
  beforeEach(() => { localStorage.clear(); paramsStore.publish({ ...DEFAULT_PARAMS }) })

  it('usa los valores por defecto si no hay nada guardado', () => {
    expect(loadParams({ getItem: () => null })).toEqual(DEFAULT_PARAMS)
  })
  it('restaura valores válidos', () => {
    const saved = JSON.stringify({ sL: 7, sC: 80.5, sB: 10, sS: 2, sP: 'tazas' })
    expect(loadParams({ getItem: () => saved })).toEqual({ sL: 7, sC: 80.5, sB: 10, sS: 2, sP: 'tazas' })
  })
  it('ignora valores inválidos o fuera de rango', () => {
    const saved = JSON.stringify({ sL: 99, sC: 'abc', sB: -5, sS: 2, sP: 'opcion-que-no-existe' })
    expect(loadParams({ getItem: () => saved })).toEqual({ ...DEFAULT_PARAMS, sS: 2 })
  })
  it('tolera JSON roto', () => {
    expect(loadParams({ getItem: () => '{roto' })).toEqual(DEFAULT_PARAMS)
  })
  it('setParam actualiza el estado y lo guarda', () => {
    setParam('sL', 9)
    setParam('sP', 'vela')
    expect(getParams()).toMatchObject({ sL: 9, sP: 'vela' })
    expect(JSON.parse(localStorage.getItem(PARAM_KEY) as string)).toMatchObject({ sL: 9, sP: 'vela' })
  })
})

describe('controller', () => {
  it('delega en las acciones registradas y no falla sin motor', () => {
    expect(() => controller.reset()).not.toThrow()
    const reset = vi.fn()
    controller.register({ isRunning: () => true, setRunning: vi.fn(), reset, toggleSound: vi.fn(), setCamera: vi.fn(), exportCsv: vi.fn(), toggleFullscreen: vi.fn(), saveScenario: vi.fn(), clearLog: vi.fn() })
    controller.reset()
    expect(reset).toHaveBeenCalled()
    expect(controller.isRunning()).toBe(true)
    controller.unregister()
    expect(controller.isRunning()).toBe(false)
  })
})
