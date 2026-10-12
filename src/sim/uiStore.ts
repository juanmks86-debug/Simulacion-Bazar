import { createStore } from './createStore'

/* Estado de la interfaz: menú lateral (modo ampliado y menú móvil). */
export const uiStore = createStore({ collapsed: false, menuOpen: false })
export const toggleCollapsed = () => uiStore.publish({ collapsed: !uiStore.getSnapshot().collapsed })
