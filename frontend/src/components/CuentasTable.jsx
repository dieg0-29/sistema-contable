export default function CuentasTable({ cuentas, loading, error }) {
  if (loading) return <p>Cargando cuentas...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!cuentas.length) return <p>No hay cuentas registradas.</p>

  return (
    <div className="section-block table-wrapper" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Catálogo de cuentas</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th className="table-header" style={{ textAlign: 'center', padding: '12px' }}>Código</th>
            <th className="table-header" style={{ textAlign: 'left', padding: '12px' }}>Descripción</th>
            <th className="table-header" style={{ textAlign: 'center', padding: '12px' }}>Clasificación</th>
            <th className="table-header" style={{ textAlign: 'center', padding: '12px' }}>Naturaleza</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((cuenta) => (
            <tr 
              key={cuenta.id_cuenta} 
              style={{ 
                borderBottom: '1px solid #eee',
                // Resaltamos en negrita las cuentas padre (las que no aceptan movimiento)
                fontWeight: cuenta.acepta_movimiento ? 'normal' : 'bold' 
              }}
            >
              {/* Código centrado */}
              <td style={{ textAlign: 'center', padding: '10px' }}>
                {cuenta.cod_cuenta}
              </td>
              
              {/* Descripción con sangría visual según el nivel, pero sin mostrar el número del nivel */}
              <td style={{ 
                textAlign: 'left', 
                padding: '10px', 
                paddingLeft: `${(cuenta.nivel_cuenta - 1) * 25}px` 
              }}>
                {cuenta.descp_cuenta}
              </td>
              
              {/* Clasificación y Naturaleza centradas */}
              <td style={{ textAlign: 'center', padding: '10px', textTransform: 'capitalize' }}>
                {cuenta.clasificacion_cuenta}
              </td>
              <td style={{ textAlign: 'center', padding: '10px', textTransform: 'capitalize' }}>
                {cuenta.naturaleza_cuenta}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
