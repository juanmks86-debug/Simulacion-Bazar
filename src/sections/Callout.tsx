// Advertencia metodológica (contenido estático)
export default function Callout() {
  return (
    <div className="callout callout-warning">
      ⚠️
      {' '}
      <b>
        Advertencia metodológica (incorporada tras devolución docente):
      </b>
      {' '}
      El dataset utilizado es sintético y de muestra acotada (188 tickets, 601 registros finales). Una validación de estabilidad mediante
      {' '}
      <b>
        Bootstrap (500 remuestreos)
      </b>
      {' '}
      demostró que la regla ganadora se sostiene en el
      {' '}
      <b>
        56,4% de los remuestreos
      </b>
      . Por lo tanto, los resultados constituyen una
      {' '}
      <b>
        prueba de concepto metodológica
      </b>
      {' '}
      e hipótesis comercial a validar con datos reales mediante un plan piloto.
    </div>
  )
}
