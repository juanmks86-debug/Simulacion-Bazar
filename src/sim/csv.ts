/* Lector de CSV tolerante (sin dependencias): separador , ; o tab, comillas, BOM y saltos de línea Windows. */

export function detectDelimiter(headerLine: string): string {
  const counts = [',', ';', '\t'].map((d) => ({ d, n: headerLine.split(d).length - 1 }))
  counts.sort((a, b) => b.n - a.n)
  return counts[0].n > 0 ? counts[0].d : ','
}

export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '')
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? ''
  const delim = detectDelimiter(firstLine)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === delim) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows.map((r) => r.map((c) => c.trim()))
}

/** Convierte "1.234,56", "1234.56", "$ 1.200" o "3" en número. Devuelve NaN si no se puede. */
export function parseNumber(raw: string): number {
  let s = raw.replace(/[^\d.,-]/g, '')
  if (!s) return NaN
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    // el último separador es el decimal
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma > -1) {
    // "1,5" decimal; "1,234" o "1,234,567" miles
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.')
  } else if (lastDot > -1) {
    // "1.234" o "1.234.567" miles (formato argentino); "1.5" decimal
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  }
  return Number(s)
}

export const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
