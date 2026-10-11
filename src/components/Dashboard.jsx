import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '../routes.js'
import html from '../legacy/content.html?raw'
import { initBazar } from '../legacy/engine.js'

// Contenido (header, KPIs, canvas 3D, gráficos...). Se monta UNA vez y no se vuelve a renderizar,
// así la simulación sigue corriendo mientras navegás entre rutas.
const Content = memo(function Content() {
  return <div className="wrap" id="bazarRoot" dangerouslySetInnerHTML={{ __html: html }} />
})

export default function Dashboard() {
  const { pathname } = useLocation()
  const route = ROUTES.find((r) => r.path === pathname) ?? ROUTES[0]
  const ready = useRef(false)

  // Arranca el motor de simulación una sola vez
  useEffect(() => {
    const stop = initBazar()
    ready.current = true
    return stop
  }, [])

  // Cada ruta muestra sus bloques y oculta el resto
  useLayoutEffect(() => {
    const root = document.getElementById('bazarRoot')
    if (!root) return
    root.querySelectorAll('[data-pages]').forEach((el) => {
      const pages = el.dataset.pages.split(' ')
      el.classList.toggle('is-hidden', !(pages.includes('*') || pages.includes(route.page)))
    })
    // contenedores con 2 tarjetas: si queda una sola visible, que ocupe todo el ancho
    root.querySelectorAll('.grid-main, .bottom-sections').forEach((el) => {
      const visible = [...el.children].filter((c) => !c.classList.contains('is-hidden'))
      el.classList.toggle('legacy-single', visible.length === 1)
    })
    window.__bazarCloseMenu?.()
    window.scrollTo({ top: 0 })
  }, [route.page])

  useEffect(() => {
    document.title = `${route.label} · Bazar Inteligente`
  }, [route])

  return <Content />
}
