export default function DiarioTable({ data, loading, error }) {
  if (loading) return <p>Cargando libro diario...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!data.length) return <p>No hay movimientos en el libro diario.</p>

  const transaccionesAgrupadas = Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.id_tsc]) {
        acc[item.id_tsc] = {
          id_tsc: item.id_tsc,
          fecha_tsc: item.fecha_tsc,
          glosa: item.glosa,
          lineas: []
        }
      }

      acc[item.id_tsc].lineas.push(item)
      return acc
    }, {})
  )

  function formatearFecha(fecha) {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-PE')
  }

  function formatearMonto(monto) {
    return Number(monto).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <div className="diario-section">
      <div className="diario-title-block">
        <h2>Libro diario</h2>
        <p>Registro ordenado de operaciones contables</p>
      </div>

      <div className="diario-header">
        <div></div>
        <div>Fecha</div>
        <div>Cuenta</div>
        <div>Debe</div>
        <div>Haber</div>
      </div>

      <div className="diario-list">
        {transaccionesAgrupadas.map((transaccion, index) => (
          <div key={transaccion.id_tsc} className="diario-card">
            <div className="diario-index">{index + 1}</div>

            <div className="diario-content">
              {transaccion.lineas.map((linea, idx) => (
                <div
                  key={`${linea.id_tsc}-${linea.id_detalle}-${linea.orden}`}
                  className={`diario-linea ${
                    idx > 0 ? 'diario-linea-secundaria' : 'diario-linea-principal'
                  }`}
                >
                  <div className="diario-fecha">
                    {idx === 0 ? formatearFecha(transaccion.fecha_tsc) : ''}
                  </div>

                  <div className="diario-cuenta">
                    {linea.cod_cuenta} {linea.descp_cuenta}
                  </div>

                  <div className="diario-monto">
                    {Number(linea.debe) > 0 ? formatearMonto(linea.debe) : ''}
                  </div>

                  <div className="diario-monto">
                    {Number(linea.haber) > 0 ? formatearMonto(linea.haber) : ''}
                  </div>
                </div>
              ))}

              <div className="diario-glosa">
                Glosa: {transaccion.glosa}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}