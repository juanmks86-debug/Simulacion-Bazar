import { useEffect } from 'react'
import { controller } from '../sim/controller'
import { toggleCollapsed } from '../sim/uiStore'

// Atajos para la defensa: Espacio (pausa), R (reiniciar), M (sonido), Z (modo ampliado), 1/2/3 (cámaras)
export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(t.tagName)) return
      if (e.code === 'Space') { e.preventDefault(); controller.setRunning(!controller.isRunning()) }
      else if (e.code === 'KeyR') { controller.reset(); controller.setRunning(true) }
      else if (e.code === 'KeyM') controller.toggleSound()
      else if (e.code === 'KeyZ') toggleCollapsed()
      else if (e.code === 'Digit1') controller.setCamera('general')
      else if (e.code === 'Digit2') controller.setCamera('combo')
      else if (e.code === 'Digit3') controller.setCamera('caja')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
