export default function CuentasTable({ cuentas, loading, error }) {
  if (loading) return <p>Cargando cuentas...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!cuentas.length) return <p>No hay cuentas registradas.</p>

  return (
    <div className="section-block table-wrapper">
      <h2>Catálogo de cuentas</h2>

      <table>
        <thead>
          <tr>
            <th className="table-header">Código</th>
            <th className="table-header">Descripción</th>
            <th className="table-header">Clasificación</th>
            <th className="table-header">Naturaleza</th>
            <th className="table-header">Nivel</th>
            <th className="table-header">Movimiento</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((cuenta) => (
            <tr key={cuenta.id_cuenta}>
              <td>{cuenta.cod_cuenta}</td>
              <td>{cuenta.descp_cuenta}</td>
              <td>{cuenta.clasificacion_cuenta}</td>
              <td>{cuenta.naturaleza_cuenta}</td>
              <td>{cuenta.nivel_cuenta}</td>
              <td>{cuenta.acepta_movimiento ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}