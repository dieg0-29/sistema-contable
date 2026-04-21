export default function EstadosFinancieros({
    balance,
    resultados,
    loading,
    error
}) {
    if (loading) return <p>Cargando estados financieros...</p>
    if (error) return <p className="error-text">{error}</p>

    return (
        <div className="card-section">

            {/* BALANCE GENERAL */}
            <section>
                <h2>Balance general</h2>

                {!balance.length ? (
                    <p>No hay datos.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Cuenta</th>
                                    <th>Clasificación</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balance.map((item) => (
                                    <tr key={item.id_cuenta}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ESTADO DE RESULTADOS */}
            <section>
                <h2>Estado de resultados</h2>

                {!resultados.length ? (
                    <p>No hay datos.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Cuenta</th>
                                    <th>Clasificación</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((item) => (
                                    <tr key={item.id_cuenta}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </div>
    )
}