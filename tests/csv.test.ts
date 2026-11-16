import { describe, expect, it } from 'vitest'
import { parseCsv, parseNumber } from '../src/sim/csv'
import { parseSales, summarize, toBaskets } from '../src/sim/salesData'
import { clearData, dataStore, loadCsvText } from '../src/sim/dataStore'

describe('parseCsv', () => {
  it('detecta coma, punto y coma y tabulación', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']])
    expect(parseCsv('a;b\n1;2')).toEqual([['a', 'b'], ['1', '2']])
    expect(parseCsv('a\tb\n1\t2')).toEqual([['a', 'b'], ['1', '2']])
  })
  it('maneja comillas, comas internas, BOM y saltos de línea de Windows', () => {
    const rows = parseCsv('\uFEFFticket,producto\r\n1,"Taza, grande"\r\n2,"Plato ""Londres"""\r\n\r\n')
    expect(rows).toEqual([['ticket', 'producto'], ['1', 'Taza, grande'], ['2', 'Plato "Londres"']])
  })
})

describe('parseNumber', () => {
  it.each([
    ['1234', 1234], ['1234.5', 1234.5], ['1,5', 1.5], ['1.234', 1234], ['1.234,56', 1234.56],
    ['1,234.56', 1234.56], ['$ 14.000', 14000], ['3', 3],
  ])('%s → %s', (raw, n) => expect(parseNumber(raw)).toBeCloseTo(n as number))
  it('devuelve NaN si no es número', () => expect(parseNumber('abc')).toBeNaN())
})

describe('parseSales', () => {
  it('reconoce encabezados alternativos (con tildes y mayúsculas)', () => {
    const { sales } = parseSales('Factura;Artículo;Cantidad;Precio\nA1;Platos Londres;2;$ 14.000\nA1;Taza de café;1;2.000')
    expect(sales).toHaveLength(2)
    expect(sales[0]).toMatchObject({ ticket: 'A1', product: 'Platos Londres', qty: 2, price: 14000 })
  })
  it('unifica el mismo producto escrito distinto (mayúsculas, espacios)', () => {
    const { sales } = parseSales('ticket,producto\n1,Platos Londres\n2,  platos   londres ')
    expect(new Set(sales.map((s) => s.product)).size).toBe(1)
  })
  it('avisa cuando faltan columnas opcionales o hay filas inválidas', () => {
    const { warnings } = parseSales('ticket,producto\n1,Taza\n,Plato')
    expect(warnings.join(' ')).toMatch(/ignoraron 1 fila/)
    expect(warnings.join(' ')).toMatch(/cantidad/)
  })
  it('advierte precios faltantes o inválidos por fila', () => {
    const { warnings, sales } = parseSales('ticket,producto,precio\n1,Taza,1200\n2,Plato,abc')
    expect(sales[1].price).toBeUndefined()
    expect(warnings.join(' ')).toMatch(/1 fila.*sin precio válido/)
  })
  it('falla con un mensaje claro si faltan las columnas obligatorias', () => {
    expect(() => parseSales('x,y\n1,2')).toThrow(/columnas obligatorias/)
    expect(() => parseSales('ticket,producto')).toThrow(/vacío/)
  })
})

describe('canastas y resumen', () => {
  const { sales } = parseSales('ticket,producto,cantidad,precio\n1,A,2,100\n1,B,1,50\n1,A,1,100\n2,A,1,100')
  it('arma una canasta de productos únicos por ticket', () => {
    expect(toBaskets(sales).map((b) => b.join('+')).sort()).toEqual(['A', 'A+B'])
  })
  it('calcula tickets, unidades e ingresos', () => {
    const s = summarize(sales)
    expect(s).toMatchObject({ tickets: 2, lines: 4, units: 5, products: 2, revenue: 450 })
    expect(s.top[0]).toMatchObject({ product: 'A', tickets: 2, units: 4 })
  })
  it('no presenta ingresos parciales como si fueran totales', () => {
    const { sales } = parseSales('ticket,producto,precio\n1,Taza,1200\n2,Taza,\n3,Plato,3000')
    const summary = summarize(sales)
    expect(summary.revenue).toBeNull()
    expect(summary.top.find((p) => p.product === 'Taza')?.revenue).toBeNull()
    expect(summary.top.find((p) => p.product === 'Plato')?.revenue).toBe(3000)
  })
  it('un resumen vacío no produce NaN', () => {
    expect(summarize([]).avgBasket).toBe(0)
    expect(summarize([]).revenue).toBeNull()
  })
})


describe('almacén de CSV', () => {
  it('conserva el último archivo válido si el nuevo CSV no se puede leer', () => {
    clearData()
    expect(loadCsvText('ticket,producto\nA1,Taza', 'ventas-validas.csv')).toBe(true)
    expect(loadCsvText('x,y\n1,2', 'archivo-invalido.csv')).toBe(false)
    const state = dataStore.getSnapshot()
    expect(state.fileName).toBe('ventas-validas.csv')
    expect(state.sales).toHaveLength(1)
    expect(state.error).toMatch(/se conservan los datos válidos.*ventas-validas.csv/i)
    clearData()
  })
})
