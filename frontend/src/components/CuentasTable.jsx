export default function CuentasTable({ cuentas, loading, error }) {
  if (loading) return <p>Cargando cuentas...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!cuentas.length) return <p>No hay cuentas registradas.</p>

  return (
    <div className="section-block table-wrapper cuentas-wrapper">
      <h2 className="cuentas-title">Catálogo de cuentas</h2>

      <table className="cuentas-table">
        <thead>
          <tr className="cuentas-header-row">
            <th className="table-header cuentas-th-center">Código</th>
            <th className="table-header cuentas-th-left">Descripción</th>
            <th className="table-header cuentas-th-center">Clasificación</th>
            <th className="table-header cuentas-th-center">Naturaleza</th>
          </tr>
        </thead>

        <tbody>
          {cuentas.map((cuenta) => (
            <tr
              key={cuenta.id_cuenta}
              className={`cuentas-row ${
                cuenta.acepta_movimiento ? '' : 'cuentas-row-parent'
              }`}
            >
              <td className="cuentas-cell-center">
                {cuenta.cod_cuenta}
              </td>

              <td
                className="cuentas-cell-description"
              >
                {cuenta.descp_cuenta}
              </td>

              <td className="cuentas-cell-center cuentas-capitalize">
                {cuenta.clasificacion_cuenta}
              </td>

              <td className="cuentas-cell-center cuentas-capitalize">
                {cuenta.naturaleza_cuenta}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}