/* Prueba de regresión determinista (opcional, ~1-5 min).
 *
 * Corre la simulación completa dentro de jsdom con azar y reloj fijos y compara los resultados
 * (KPIs, clientes, barras de ventas, catálogo, registro, hora y promoción) con tests/regression/golden-<frames>.json.
 * Sirve para comprobar que un refactor del motor NO cambió el comportamiento.
 *
 *   npm run test:regression            # 900 cuadros (rápido)
 *   npm run test:regression -- --full  # 3600 cuadros
 *   npm run test:regression -- --update  # reescribe el golden (solo si el cambio de comportamiento es intencional)
 *
 * Requiere el paquete `canvas` para que jsdom pueda dibujar. No está en package.json (así `npm install` y Vercel
 * no dependen de él): instalalo solo cuando quieras correr esta prueba con `npm i --no-save canvas`.
 */
try { require.resolve('canvas') } catch { console.error('Falta el paquete canvas. Instalalo con: npm i --no-save canvas'); process.exit(1) }
const { JSDOM, VirtualConsole } = require('jsdom')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const args = process.argv.slice(2)
const FRAMES = args.includes('--full') ? 3600 : 900
const UPDATE = args.includes('--update')
const root = path.resolve(__dirname, '../..')
const out = path.join(root, 'dist-regression')
const golden = path.join(__dirname, `golden-${FRAMES}.json`)

console.log('Compilando bundle de prueba…')
execSync('npx vite build --config tests/regression/vite.config.ts', { cwd: root, stdio: 'ignore', env: { ...process.env, OUT: out } })

const errs = []
const vc = new VirtualConsole()
vc.on('jsdomError', (e) => errs.push('jsdomError ' + e.message))
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/#/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
})
const w = dom.window
w.scrollTo = () => {}

// Azar con semilla. Lo consumido al cargar el bundle (librerías) no entra en la secuencia de la simulación.
let seed = 12345, pre = true, pseed = 1
w.Math.random = () => {
  if (pre) { pseed = (pseed * 1664525 + 1013904223) % 4294967296; return pseed / 4294967296 }
  seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296
}
// Reloj y requestAnimationFrame manuales: 16,7 ms por cuadro
let T = 0, q = []
w.performance.now = () => T
w.requestAnimationFrame = (f) => { q.push(f); return q.length }
w.cancelAnimationFrame = () => {}
w.eval(fs.readFileSync(path.join(out, 'app.js'), 'utf8'))
pre = false; seed = 12345

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  await sleep(400)
  for (let i = 0; i < FRAMES; i++) { T += 16.7; const cur = q; q = []; cur.forEach((f) => f(T)) }
  await sleep(500)
  const d = w.document, t = (id) => d.getElementById(id)?.textContent
  const res = {
    kpi: ['kRevenue', 'kMargin', 'kSales', 'kConversion', 'kMarginPct', 'kCombo', 'kBasket'].map(t),
    clients: d.getElementById('cls').children.length,
    head: [t('clk'), t('per'), t('prm')],
  }
  for (const [h, k] of [['/ventas', 'bars'], ['/eventos', 'log'], ['/productos', 'catalog']]) {
    w.location.hash = h; await sleep(400)
    if (k === 'bars') res.bars = [...d.querySelectorAll('#productChart .barval')].map((e) => e.textContent).join(',')
    if (k === 'log') res.log = t('lg').replace(/\s+/g, '').slice(0, 200)
    if (k === 'catalog') res.catalog = d.querySelectorAll('#catalogTbody tr').length
  }
  const canvasHash = crypto.createHash('md5').update(d.getElementById('cv').toDataURL()).digest('hex')
  fs.rmSync(out, { recursive: true, force: true })
  if (errs.length) { console.error('Errores en la página:', errs.slice(0, 3)); process.exit(1) }

  if (UPDATE) { fs.writeFileSync(golden, JSON.stringify(res, null, 2) + '\n'); console.log('Golden actualizado:', golden); process.exit(0) }
  if (!fs.existsSync(golden)) { console.error('No existe', golden, '(usá --update para crearlo)'); process.exit(1) }
  const expected = JSON.parse(fs.readFileSync(golden, 'utf8'))
  let ok = true
  for (const k of Object.keys(expected)) {
    const same = JSON.stringify(expected[k]) === JSON.stringify(res[k])
    if (!same) { ok = false; console.error(`✗ ${k}\n  esperado: ${JSON.stringify(expected[k])}\n  obtenido: ${JSON.stringify(res[k])}`) }
    else console.log(`✓ ${k}`)
  }
  console.log('(hash del canvas, informativo; depende de las fuentes del sistema):', canvasHash)
  process.exit(ok ? 0 : 1)
})()
