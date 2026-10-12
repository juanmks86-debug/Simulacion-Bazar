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
