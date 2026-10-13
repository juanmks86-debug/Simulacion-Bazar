import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { dataStore } from '../sim/dataStore'
import { goSlide, presentationStore, slidesFor, stopPresentation, toggleNotes } from '../sim/presentation'
import { uiStore } from '../sim/uiStore'

/** Modo presentación: recorre las secciones con ← → (o Espacio), N muestra/oculta notas, Esc sale. */
export default function PresentationBar() {
  const { active, index, notes } = useStore(presentationStore, (s) => s)
  const hasData = useStore(dataStore, (s) => s.sales.length > 0)
  const slides = useMemo(() => slidesFor(hasData), [hasData])
  const i = Math.min(index, slides.length - 1)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prevCollapsed = useRef(false)

  // Al entrar: oculta el menú y la cabecera; al salir: los restaura
  useEffect(() => {
    if (!active) return
    prevCollapsed.current = uiStore.getSnapshot().collapsed
    uiStore.publish({ collapsed: true, menuOpen: false })
    document.body.classList.add('presenting')
    return () => {
      document.body.classList.remove('presenting')
      uiStore.publish({ collapsed: prevCollapsed.current })
    }
  }, [active])

  // Navega solo cuando la diapositiva cambia y la ruta actual es otra (evita empujar la misma ruta en bucle)
  const path = slides[i].path
  useEffect(() => {
    if (active && pathname !== path) navigate(path)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, path])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return
      const next = ['ArrowRight', 'PageDown', 'Space', 'Enter'], prev = ['ArrowLeft', 'PageUp', 'Backspace']
      if (next.includes(e.code)) { e.preventDefault(); goSlide(i + 1, slides.length) }
      else if (prev.includes(e.code)) { e.preventDefault(); goSlide(i - 1, slides.length) }
      else if (e.code === 'Home') goSlide(0, slides.length)
      else if (e.code === 'End') goSlide(slides.length - 1, slides.length)
      else if (e.code === 'KeyN') toggleNotes()
      else if (e.code === 'Escape') stopPresentation()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, i, slides.length])

  if (!active) return null
  const slide = slides[i]
  return (
    <div className="presentation-bar no-print" role="region" aria-label="Modo presentación">
      {notes && (
        <ul className="presentation-notes" id="presNotes">
          {slide.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
      <div className="presentation-controls">
        <button className="mini-btn" id="presPrev" onClick={() => goSlide(i - 1, slides.length)} disabled={i === 0} aria-label="Anterior">◀</button>
        <div className="presentation-title">
          <b id="presCounter">{i + 1}/{slides.length}</b> · <span id="presTitle">{slide.title}</span>
          <div className="presentation-progress"><div style={{ width: `${((i + 1) / slides.length) * 100}%` }} /></div>
        </div>
        <button className="mini-btn" id="presNext" onClick={() => goSlide(i + 1, slides.length)} disabled={i === slides.length - 1} aria-label="Siguiente">▶</button>
        <button className="mini-btn" onClick={toggleNotes}>{notes ? 'Ocultar notas (N)' : 'Notas (N)'}</button>
        <button className="mini-btn" id="presExit" onClick={stopPresentation}>✕ Salir (Esc)</button>
      </div>
    </div>
  )
}
