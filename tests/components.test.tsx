import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import Calculator from '../src/sections/Calculator'
import Crisp from '../src/sections/Crisp'
import Scenarios from '../src/sections/Scenarios'
import Kpis from '../src/components/Kpis'
import { ROUTES } from '../src/routes'
import { simStore } from '../src/sim/store'

// El motor necesita un canvas real; en los tests se reemplaza por uno vacío
vi.mock('../src/sim/engine', () => ({ initBazar: () => () => {} }))

describe('rutas', () => {
  it('cada ruta del menú es única', () => {
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length)
  })
  it.each([
    ['/calculadora', /Definiciones Financieras/],
    ['/crisp', /Fases de CRISP-DM/],
    ['/productos', /Catálogo de Productos/],
    ['/escenarios', /Comparador de Escenarios/],
    ['/eventos', /Registro de Eventos/],
  ])('%s muestra su sección', (path, title) => {
    render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })
  it('/montecarlo carga su gráfico bajo demanda', async () => {
    render(<MemoryRouter initialEntries={['/montecarlo']}><App /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: /Monte Carlo \(10\.000 Escenarios\)/ }, { timeout: 20000 })).toBeInTheDocument()
    expect(document.getElementById('mcMeanB')).toHaveTextContent('$')
  }, 30000)
  it('una ruta desconocida vuelve al inicio', () => {
    render(<MemoryRouter initialEntries={['/no-existe']}><App /></MemoryRouter>)
    expect(screen.getByText(/Advertencia metodológica/)).toBeInTheDocument()
  })
  it('el canvas y los controles siguen montados en cualquier ruta (el motor no se corta)', () => {
    const { container } = render(<MemoryRouter initialEntries={['/crisp']}><App /></MemoryRouter>)
    expect(container.querySelector('canvas#cv')).not.toBeNull()
    expect(container.querySelector('#sL')).not.toBeNull()
  })
})

describe('Calculadora de margen', () => {
  it('muestra los valores del informe con 15% y reacciona al slider', () => {
    render(<Calculator />)
    expect(screen.getByText('$ 47.750')).toBeInTheDocument()
    expect(document.getElementById('calcMargenCon')).toHaveTextContent('48.1%')
    fireEvent.change(document.getElementById('calcDescRange') as HTMLInputElement, { target: { value: '30' } })
    expect(document.getElementById('calcDescVal')).toHaveTextContent('30')
    expect(document.getElementById('calcPvpCombo')).toHaveTextContent('$ 42.500')
  })
})

describe('CRISP-DM', () => {
  it('cambia el detalle al elegir una fase', () => {
    render(<Crisp />)
    expect(document.getElementById('crispTitle')).toHaveTextContent(/Comprensión del Negocio/)
    fireEvent.click(screen.getByText('Modeling'))
    expect(document.getElementById('crispTitle')).toHaveTextContent(/Modelado \(Apriori Algorithm\)/)
  })
})

describe('estado de la simulación en pantalla', () => {
  it('los KPIs reflejan lo que publica el motor', () => {
    render(<Kpis />)
    act(() => simStore.publish({ kpi: { revenue: '$ 89.000', margin: '$ 43.400', sales: 7, combo: 1, basket: 0, conversion: '50.0', marginPct: '48.8' } }))
    expect(document.getElementById('kRevenue')).toHaveTextContent('$ 89.000')
    expect(document.getElementById('kConversion')).toHaveTextContent('Conversión: 50.0%')
  })
  it('los escenarios guardados se listan', () => {
    render(<Scenarios />)
    expect(screen.getByText(/Todavía no guardaste escenarios/)).toBeInTheDocument()
    act(() => simStore.publish({ scenarios: [{ promo: '2x1 en Tazas de café', comboProb: 57.1, basketProb: 35, visits: 12, sales: 5, revenue: 127000, margin: 62800, combos: 1 }] }))
    expect(screen.getByText(/2x1 en Tazas de café/)).toBeInTheDocument()
    expect(screen.getByText('$ 127.000')).toBeInTheDocument()
  })
})

import Datos from '../src/sections/Datos'
import Informe from '../src/sections/Informe'
import MonteCarlo from '../src/sections/MonteCarlo'
import { clearData } from '../src/sim/dataStore'
import { getParams } from '../src/sim/params'
import { presentationStore, startPresentation, stopPresentation } from '../src/sim/presentation'
import { money } from '../src/sim/calculator'

describe('Monte Carlo: tabla consistente con los indicadores', () => {
  it('la fila Caso Base muestra el mismo margen que “Media Combo Activo (B)”', () => {
    render(<MonteCarlo />)
    const headline = document.getElementById('mcMeanB')?.textContent
    const baseRow = document.querySelector('#mcSensitivity tr[data-base="true"]')
    expect(headline).toMatch(/^\$ /)
    expect(baseRow).toHaveTextContent(headline as string)
    expect(document.querySelectorAll('#mcSensitivity tbody tr')).toHaveLength(4)
  })
  it('al re-ejecutar siguen coincidiendo', () => {
    render(<MonteCarlo />)
    fireEvent.click(document.getElementById('btnRunMC') as HTMLElement)
    const headline = document.getElementById('mcMeanB')?.textContent as string
    expect(document.querySelector('#mcSensitivity tr[data-base="true"]')).toHaveTextContent(headline)
  })
})

describe('Datos reales (CSV)', () => {
  it('con el ejemplo sintético muestra resumen, Pack Mesa y reglas, y avisa que no son ventas reales', () => {
    clearData()
    render(<MemoryRouter><Datos /></MemoryRouter>)
    expect(screen.getByText(/Todavía no cargaste datos/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Probar con ejemplo sintético/ }))
    expect(document.getElementById('dTickets')).toHaveTextContent('220')
    expect(screen.getByText(/DATOS DE EJEMPLO SINTÉTICOS/)).toBeInTheDocument()
    expect(document.getElementById('dataPack')).toBeInTheDocument()
    expect(document.querySelectorAll('#dataRules tbody tr').length).toBeGreaterThan(0)
  })
  it('calibrar cambia los parámetros de la simulación', () => {
    clearData()
    render(<MemoryRouter><Datos /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Probar con ejemplo sintético/ }))
    const before = { ...getParams() }
    fireEvent.click(document.getElementById('csvCalibrate') as HTMLElement)
    expect(document.getElementById('csvCalibrated')).toHaveTextContent(/Listo/)
    expect(getParams().sC).not.toBe(before.sC)
  })
  it('un archivo inválido muestra un error claro y no rompe', async () => {
    clearData()
    render(<MemoryRouter><Datos /></MemoryRouter>)
    const input = document.getElementById('csvFile') as HTMLInputElement
    const file = new File(['x,y\n1,2'], 'malo.csv', { type: 'text/csv' })
    await act(async () => { fireEvent.change(input, { target: { files: [file] } }) })
    expect(await screen.findByRole('alert')).toHaveTextContent(/columnas obligatorias/)
  })
})

describe('Informe imprimible', () => {
  it('reúne indicadores, Monte Carlo, reglas y margen, y el botón imprime', () => {
    clearData()
    const print = vi.fn()
    window.print = print
    render(<MemoryRouter><Informe /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Informe de resultados/ })).toBeInTheDocument()
    expect(document.getElementById('mcSensitivity')).toBeInTheDocument()
    expect(document.getElementById('calcPvpCombo')).toHaveTextContent(money(47750))
    fireEvent.click(document.getElementById('printReport') as HTMLElement)
    expect(print).toHaveBeenCalled()
  })
})

describe('Modo presentación', () => {
  it('recorre las secciones con las flechas y sale con Esc', () => {
    clearData()
    stopPresentation(); presentationStore.publish({ index: 0, notes: true })
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    act(() => startPresentation())
    expect(document.getElementById('presCounter')).toHaveTextContent('1/10')
    expect(document.getElementById('presTitle')).toHaveTextContent('Simulación 3D del bazar')
    fireEvent.keyDown(window, { code: 'ArrowRight' })
    expect(document.getElementById('presCounter')).toHaveTextContent('2/10')
    expect(screen.getByRole('heading', { name: /Reglas de Asociación Apriori/ })).toBeInTheDocument()
    fireEvent.keyDown(window, { code: 'ArrowLeft' })
    expect(document.getElementById('presCounter')).toHaveTextContent('1/10')
    fireEvent.keyDown(window, { code: 'KeyN' })
    expect(document.getElementById('presNotes')).toBeNull()
    fireEvent.keyDown(window, { code: 'Escape' })
    expect(document.getElementById('presCounter')).toBeNull()
    expect(document.body.classList.contains('presenting')).toBe(false)
  })
})
