/**
 * Componente para mostrar Estado de Situación Financiera y Estado de Resultados del Período
 * Estructura vertical: ESF arriba, ER debajo
 */

export default function EstadosFinancierosPeriodo({
    balance,
    resultados,
    loading,
    error
}) {
    if (loading) return <p>Cargando estados financieros...</p>
    if (error) return <p className="error-text">{error}</p>

    // Transformar balance a ESF con estructura de Activo, Pasivo, Patrimonio
    const esf = construirESF(balance)
    
    // Transformar resultados a ER con bloques y subtotales
    const er = construirER(resultados)

    return (
        <div className="card-section">
            {/* ESTADO DE SITUACIÓN FINANCIERA */}
            <section>
                <h2>Estado de Situación Financiera</h2>
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
                            {/* ACTIVO */}
                            <tr className="section-header">
                                <td colSpan="4"><strong>ACTIVO</strong></td>
                            </tr>
                            {esf.activo.length > 0 ? (
                                esf.activo.map((item) => (
                                    <tr key={`activo-${item.id_cuenta}`}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Sin datos en Activo.</td>
                                </tr>
                            )}
                            <tr className="subtotal-row">
                                <td colSpan="3"><strong>Total Activo</strong></td>
                                <td className="amount-cell">
                                    <strong>{esf.totalActivo.toFixed(2)}</strong>
                                </td>
                            </tr>

                            {/* PASIVO */}
                            <tr className="section-header">
                                <td colSpan="4"><strong>PASIVO</strong></td>
                            </tr>
                            {esf.pasivo.length > 0 ? (
                                esf.pasivo.map((item) => (
                                    <tr key={`pasivo-${item.id_cuenta}`}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Sin datos en Pasivo.</td>
                                </tr>
                            )}
                            <tr className="subtotal-row">
                                <td colSpan="3"><strong>Total Pasivo</strong></td>
                                <td className="amount-cell">
                                    <strong>{esf.totalPasivo.toFixed(2)}</strong>
                                </td>
                            </tr>

                            {/* PATRIMONIO */}
                            <tr className="section-header">
                                <td colSpan="4"><strong>PATRIMONIO</strong></td>
                            </tr>
                            {esf.patrimonio.length > 0 ? (
                                esf.patrimonio.map((item) => (
                                    <tr key={`patrimonio-${item.id_cuenta}`}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Sin datos en Patrimonio.</td>
                                </tr>
                            )}
                            <tr className="subtotal-row">
                                <td colSpan="3"><strong>Total Patrimonio</strong></td>
                                <td className="amount-cell">
                                    <strong>{esf.totalPatrimonio.toFixed(2)}</strong>
                                </td>
                            </tr>

                            {/* TOTAL PASIVO + PATRIMONIO */}
                            <tr className="total-row">
                                <td colSpan="3"><strong>Total Pasivo + Patrimonio</strong></td>
                                <td className="amount-cell">
                                    <strong>{(esf.totalPasivo + esf.totalPatrimonio).toFixed(2)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ESTADO DE RESULTADOS DEL PERÍODO */}
            <section>
                <h2>Estado de Resultados del Período</h2>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cuenta</th>
                                <th>Clasificación</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* INGRESOS */}
                            <tr className="section-header">
                                <td colSpan="4"><strong>INGRESOS</strong></td>
                            </tr>
                            {er.ingresos.length > 0 ? (
                                er.ingresos.map((item) => (
                                    <tr key={`ingreso-${item.id_cuenta}`}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Sin datos en Ingresos.</td>
                                </tr>
                            )}
                            <tr className="subtotal-row">
                                <td colSpan="3"><strong>Total Ingresos</strong></td>
                                <td className="amount-cell">
                                    <strong>{er.totalIngresos.toFixed(2)}</strong>
                                </td>
                            </tr>

                            {/* COSTOS Y GASTOS */}
                            <tr className="section-header">
                                <td colSpan="4"><strong>COSTOS Y GASTOS</strong></td>
                            </tr>
                            {er.costos.length > 0 ? (
                                er.costos.map((item) => (
                                    <tr key={`costo-${item.id_cuenta}`}>
                                        <td>{item.cod_cuenta}</td>
                                        <td>{item.descp_cuenta}</td>
                                        <td>{item.clasificacion_cuenta}</td>
                                        <td className="amount-cell">
                                            {Number(item.saldo).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Sin datos en Costos y Gastos.</td>
                                </tr>
                            )}
                            <tr className="subtotal-row">
                                <td colSpan="3"><strong>Total Costos y Gastos</strong></td>
                                <td className="amount-cell">
                                    <strong>{er.totalCostos.toFixed(2)}</strong>
                                </td>
                            </tr>

                            {/* UTILIDAD NETA */}
                            <tr className="total-row">
                                <td colSpan="3"><strong>Utilidad Neta</strong></td>
                                <td className="amount-cell">
                                    <strong>{er.utilidadNeta.toFixed(2)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

/**
 * Construir estructura de ESF a partir de datos de balance
 */
const TOLERANCIA_SALDO = 0.01

function tieneSaldoVisible(saldo) {
    const valor = Number(saldo)
    return Number.isFinite(valor) && Math.abs(valor) >= TOLERANCIA_SALDO
}

function construirESF(balance) {
    const activo = balance.filter(item => 
        item.clasificacion_cuenta?.toUpperCase().includes('ACTIVO')
        && tieneSaldoVisible(item.saldo)
    )
    
    const pasivo = balance.filter(item => 
        item.clasificacion_cuenta?.toUpperCase().includes('PASIVO')
        && tieneSaldoVisible(item.saldo)
    )
    
    const patrimonio = balance.filter(item => {
        const clase = item.clasificacion_cuenta?.toUpperCase() || ''
        return (clase.includes('PATRIMONIO') || clase.includes('CAPITAL') || clase.includes('RESULTADO'))
            && !clase.includes('ACTIVO') && !clase.includes('PASIVO')
            && tieneSaldoVisible(item.saldo)
    })

    const totalActivo = activo.reduce((sum, item) => sum + Number(item.saldo), 0)
    const totalPasivo = pasivo.reduce((sum, item) => sum + Number(item.saldo), 0)
    const totalPatrimonio = patrimonio.reduce((sum, item) => sum + Number(item.saldo), 0)

    return {
        activo,
        pasivo,
        patrimonio,
        totalActivo,
        totalPasivo,
        totalPatrimonio
    }
}

/**
 * Construir estructura de ER a partir de datos de resultados
 */
function construirER(resultados) {
    const ingresos = resultados.filter(item => 
        item.clasificacion_cuenta?.toUpperCase().includes('INGRESO')
        && tieneSaldoVisible(item.saldo)
    )
    
    const costos = resultados.filter(item => {
        const clase = item.clasificacion_cuenta?.toUpperCase() || ''
        return (clase.includes('COSTO') || clase.includes('GASTO') || clase.includes('PÉRDIDA'))
            && !clase.includes('INGRESO')
            && tieneSaldoVisible(item.saldo)
    })

    const totalIngresos = ingresos.reduce((sum, item) => sum + Number(item.saldo), 0)
    const totalCostos = costos.reduce((sum, item) => sum + Number(item.saldo), 0)
    const utilidadNeta = totalIngresos - totalCostos

    return {
        ingresos,
        costos,
        totalIngresos,
        totalCostos,
        utilidadNeta
    }
}
