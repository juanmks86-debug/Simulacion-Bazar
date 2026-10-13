import { createStore } from './createStore'

export interface Slide { path: string; title: string; notes: string[] }

/* Guion de la defensa: ruta a mostrar + ideas para decir (editables). */
const BASE: Record<string, Slide> = {
  simulacion: { path: '/simulacion', title: 'Simulación 3D del bazar', notes: [
    'Mostrar el flujo de clientes: entran, recorren las góndolas, hacen cola y pagan.',
    'Señalar la zona de alta rotación (Pack Mesa) y la de baja rotación (stock estancado).',
    'Usar las cámaras 🍽️ y 💳 para acercarse al combo y a la caja.',
  ] },
  reglas: { path: '/reglas', title: 'Regla de asociación Apriori', notes: [
    'Regla principal: Platos + Servilletero + Tazas ➜ Canasta de mimbre.',
    'Explicar soporte (qué tan frecuente), confianza (qué tan probable) y lift (más que el azar).',
  ] },
  aprioriFp: { path: '/apriori-fp', title: 'Apriori vs. FP-Growth', notes: [
    'Comparar ambos algoritmos: mismas reglas, distinta forma de buscarlas.',
    'Justificar por qué se eligió Apriori para este caso.',
  ] },
  datos: { path: '/datos', title: 'Validación con ventas reales', notes: [
    'Mostrar el archivo cargado, cuántos tickets tiene y qué dicen las reglas con esos datos.',
    'Comparar la confianza real del Pack Mesa con la del informe y calibrar la simulación.',
  ] },
  montecarlo: { path: '/montecarlo', title: 'Evaluación financiera Monte Carlo', notes: [
    'Apriori descubre la regla; Monte Carlo evalúa si conviene económicamente bajo incertidumbre.',
    'Leer la media del beneficio neto y la probabilidad favorable.',
    'La tabla de sensibilidad usa el mismo modelo: la fila del caso base coincide con los indicadores.',
  ] },
  bootstrap: { path: '/bootstrap', title: 'Estabilidad Bootstrap', notes: [
    'Explicar que se remuestrea para ver si la regla se mantiene estable.',
    'Aclarar los límites de un dataset chico.',
  ] },
  calculadora: { path: '/calculadora', title: 'Verificación de margen', notes: [
    'Mover el descuento de la canasta y mostrar cómo cambian el margen y el ahorro del cliente.',
    'Remarcar la caída en puntos porcentuales frente al aumento de volumen.',
  ] },
  sensibilidad: { path: '/sensibilidad', title: 'Test de sensibilidad', notes: [
    'Qué pasa si los supuestos cambian: demanda, descuento y costos.',
  ] },
  piloto: { path: '/piloto', title: 'Plan de prueba piloto', notes: [
    'Cómo validar la regla en el local antes de generalizarla.',
  ] },
  escenarios: { path: '/escenarios', title: 'Comparador de escenarios', notes: [
    'Guardar el escenario actual y comparar promociones distintas.',
  ] },
  academico: { path: '/academico', title: 'Conclusiones y autor', notes: [
    'Cerrar con las conclusiones, las limitaciones y el trabajo futuro.',
  ] },
}

export function slidesFor(hasData: boolean): Slide[] {
  const b = BASE
  return [b.simulacion, b.reglas, b.aprioriFp, ...(hasData ? [b.datos] : []), b.montecarlo, b.bootstrap, b.calculadora, b.sensibilidad, b.piloto, b.escenarios, b.academico]
}

export const presentationStore = createStore({ active: false, index: 0, notes: true })

export const startPresentation = () => presentationStore.publish({ active: true, index: 0 })
export const stopPresentation = () => presentationStore.publish({ active: false })
export const goSlide = (index: number, total: number) => presentationStore.publish({ index: Math.min(total - 1, Math.max(0, index)) })
export const toggleNotes = () => presentationStore.publish({ notes: !presentationStore.getSnapshot().notes })
