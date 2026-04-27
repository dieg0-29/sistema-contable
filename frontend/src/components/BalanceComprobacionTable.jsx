import { useMemo } from 'react'

export default function BalanceComprobacionTable({ data, loading, error }) {
    const formatearMonto = (monto) => {
        return Number(monto).toLocaleString(undefined, {
            minimumFractionDigits: 2
        })
    }

    const datosConSaldo = useMemo(() => {
        return data.map((item) => ({
            ...item,
            saldo: Number(item.total_debe) - Number(item.total_haber)
        })).filter(item => item.saldo !== 0)
    }, [data])

    const totales = useMemo(() => {
        return datosConSaldo.reduce(
            (acc, item) => ({
                debe: acc.debe + (item.saldo > 0 ? Number(item.saldo) : 0),
                haber: acc.haber + (item.saldo < 0 ? Math.abs(Number(item.saldo)) : 0)
            }),
            { debe: 0, haber: 0 }
        )
    }, [datosConSaldo])

    if (loading) return <p>Cargando balance de comprobación...</p>
    if (error) return <p className="error-text">{error}</p>
    if (!data.length) return <p>No hay movimientos.</p>

    return (
        <div className="section-block">
            <h2 className="balance-title">Balance de Comprobación</h2>

            <div className="balance-table-container">
                <table className="balance-table">
                    <thead>
                        <tr>
                            <th className="balance-col-codigo">Código</th>
                            <th className="balance-col-descripcion">Descripción</th>
                            <th className="balance-col-debe">Debe</th>
                            <th className="balance-col-haber">Haber</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosConSaldo.map((item) => (
                            <tr key={item.cod_cuenta} className="balance-row">
                                <td className="balance-col-codigo balance-cell">
                                    {item.cod_cuenta}
                                </td>
                                <td className="balance-col-descripcion balance-cell">
                                    {item.descp_cuenta}
                                </td>
                                <td className="balance-col-debe balance-cell balance-number">
                                    {item.saldo > 0 ? formatearMonto(item.saldo) : '-'}
                                </td>
                                <td className="balance-col-haber balance-cell balance-number">
                                    {item.saldo < 0 ? formatearMonto(Math.abs(item.saldo)) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="balance-totals-row">
                            <td colSpan="2" className="balance-totals-label">
                                TOTALES
                            </td>
                            <td className="balance-col-debe balance-cell balance-number balance-total">
                                {formatearMonto(totales.debe)}
                            </td>
                            <td className="balance-col-haber balance-cell balance-number balance-total">
                                {formatearMonto(totales.haber)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="balance-summary">
                <div className={`summary-item ${totales.debe === totales.haber ? 'balanced' : 'unbalanced'}`}>
                    <span className="summary-label">Estado:</span>
                    <span className="summary-value">
                        {totales.debe === totales.haber ? '✓ CUADRA' : `Diferencia: ${formatearMonto(Math.abs(totales.debe - totales.haber))}`}
                    </span>
                </div>
            </div>
        </div>
    )
}
