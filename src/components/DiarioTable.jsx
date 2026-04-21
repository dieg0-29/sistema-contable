export default function DiarioTable({ data, loading, error }) {
  if (loading) return <p>Cargando libro diario...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!data.length) return <p>No hay movimientos en el libro diario.</p>

  return (
    <div className="section-block">
      <h2>Libro diario</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>N° Operación</th>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Código</th>
              <th>Cuenta</th>
              <th>Debe</th>
              <th>Haber</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id_detalle}>
                <td>{item.numero_operacion}</td>
                <td>{item.fecha_tsc}</td>
                <td>{item.detalle}</td>
                <td>{item.cod_cuenta}</td>
                <td>{item.descp_cuenta}</td>
                <td>{Number(item.debe).toFixed(2)}</td>
                <td>{Number(item.haber).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}