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
      {' '}y, al repetir todo el análisis con
      {' '}
      <b>
        200 semillas distintas del generador
      </b>
      , el combo exacto reaparece en solo el
      {' '}
      <b>
        5,0%
      </b>
      {' '}de ellas (aunque en el 78,5% aparece algún combo de 3 o más productos). Como el generador sortea los productos de forma independiente y no incorpora asociaciones, el combo hallado es una
      {' '}
      <b>
        coincidencia muestral
      </b>
      {' '}que ilustra el método. Por lo tanto, los resultados constituyen una
      {' '}
      <b>
        prueba de concepto metodológica
      </b>
      {' '}
      e hipótesis comercial a validar con datos reales mediante un plan piloto; no demuestran comportamiento de clientes reales.
    </div>
  )
}
