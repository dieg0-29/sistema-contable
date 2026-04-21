import { useMemo, useState } from 'react'

export default function MayorTable({ data, loading, error }) {
    const [filtroCuenta, setFiltroCuenta] = useState('')

    const cuentasUnicas = useMemo(() => {
        const mapa = new Map()

        data.forEach((item) => {
            if (!mapa.has(item.cod_cuenta)) {
                mapa.set(item.cod_cuenta, {
                    cod_cuenta: item.cod_cuenta,
                    descp_cuenta: item.descp_cuenta
                })
            }
        })

        return Array.from(mapa.values())
    }, [data])

    const dataFiltrada = useMemo(() => {
        if (!filtroCuenta) return data
        return data.filter((item) => item.cod_cuenta === filtroCuenta)
    }, [data, filtroCuenta])

    if (loading) return <p>Cargando libro mayor...</p>
    if (error) return <p className="error-text">{error}</p>
    if (!data.length) return <p>No hay movimientos en el libro mayor.</p>

    return (
        <div className="section-block">
            <h2>Libro mayor</h2>

            <div className="filter-box">
                <label htmlFor="filtroCuenta">Filtrar por cuenta: </label>
                <select
                    id="filtroCuenta"
                    value={filtroCuenta}
                    onChange={(e) => setFiltroCuenta(e.target.value)}
                >
                    <option value="">Todas</option>
                    {cuentasUnicas.map((cuenta) => (
                        <option key={cuenta.cod_cuenta} value={cuenta.cod_cuenta}>
                            {cuenta.cod_cuenta} - {cuenta.descp_cuenta}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th>Fecha</th>
                            <th>N° Operación</th>
                            <th>Detalle</th>
                            <th>Debe</th>
                            <th>Haber</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataFiltrada.map((item) => (
                            <tr key={item.id_detalle}>
                                <td>{item.cod_cuenta}</td>
                                <td>{item.descp_cuenta}</td>
                                <td>{item.fecha_tsc}</td>
                                <td>{item.numero_operacion}</td>
                                <td>{item.detalle}</td>
                                <td className="amount-cell">{Number(item.debe).toFixed(2)}</td>
                                <td className="amount-cell">{Number(item.haber).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}