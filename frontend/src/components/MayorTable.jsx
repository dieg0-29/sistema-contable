import { useMemo, useState } from 'react'

export default function MayorTable({ data, loading, error }) {
    const [filtroCuenta, setFiltroCuenta] = useState('')

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return ''
        const [year, month, day] = fechaStr.split('-')
        return `${day}/${month}/${year}`
    }

    const formatearMonto = (monto) => {
        return Number(monto).toLocaleString(undefined, {
            minimumFractionDigits: 2
        })
    }

    const cuentasAgrupadas = useMemo(() => {
        const grupos = {}

        data.forEach((item) => {
            if (!grupos[item.cod_cuenta]) {
                grupos[item.cod_cuenta] = {
                    codigo: item.cod_cuenta,
                    nombre: item.descp_cuenta,
                    movimientos: []
                }
            }

            grupos[item.cod_cuenta].movimientos.push(item)
        })

        if (filtroCuenta) {
            return Object.values(grupos).filter((g) => g.codigo === filtroCuenta)
        }

        return Object.values(grupos)
    }, [data, filtroCuenta])

    const opcionesFiltro = useMemo(() => {
        const mapa = new Map()
        data.forEach((item) => mapa.set(item.cod_cuenta, item.descp_cuenta))
        return Array.from(mapa.entries())
    }, [data])

    if (loading) return <p>Cargando libro mayor...</p>
    if (error) return <p className="error-text">{error}</p>
    if (!data.length) return <p>No hay movimientos.</p>

    return (
        <div className="section-block">
            <h2 className="mayor-title">Libro Mayor</h2>

            <div className="filter-box mayor-filter-box">
                <label className="mayor-filter-label">Filtrar por cuenta: </label>

                <select
                    className="mayor-filter-select"
                    value={filtroCuenta}
                    onChange={(e) => setFiltroCuenta(e.target.value)}
                >
                    <option value="">Todas</option>
                    {opcionesFiltro.map(([cod, desc]) => (
                        <option key={cod} value={cod}>
                            {cod} - {desc}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mayor-grid">
                {cuentasAgrupadas.map((cuenta) => {
                    const sumaDebe = cuenta.movimientos.reduce(
                        (acc, m) => acc + Number(m.debe),
                        0
                    )
                    const sumaHaber = cuenta.movimientos.reduce(
                        (acc, m) => acc + Number(m.haber),
                        0
                    )
                    const saldo = sumaDebe - sumaHaber

                    return (
                        <div key={cuenta.codigo} className="mayor-card">
                            <div className="mayor-card-title">
                                <cod className="mayor-cod">{cuenta.codigo}</cod> {cuenta.nombre}
                            </div>

                            <div className="mayor-card-header">
                                <span>DEBER</span>
                                <span>HABER</span>
                            </div>

                            <div className="mayor-columns">
                                <div className="mayor-column mayor-column-debe">
                                    {cuenta.movimientos.map(
                                        (m, i) =>
                                            Number(m.debe) > 0 && (
                                                <div
                                                    key={`debe-${cuenta.codigo}-${i}`}
                                                    className="mayor-movement-row"
                                                >
                                                    <span className="mayor-movement-date">
                                                        {formatearFecha(m.fecha_tsc)}
                                                    </span>
                                                    <span className="mayor-movement-amount">
                                                        {formatearMonto(m.debe)}
                                                    </span>
                                                </div>
                                            )
                                    )}

                                    {saldo > 0 && (
                                        <div className="mayor-final-balance">
                                            <span>Saldo Final</span>
                                            <span>{formatearMonto(saldo)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mayor-column mayor-column-haber">
                                    {cuenta.movimientos.map(
                                        (m, i) =>
                                            Number(m.haber) > 0 && (
                                                <div
                                                    key={`haber-${cuenta.codigo}-${i}`}
                                                    className="mayor-movement-row"
                                                >
                                                    <span className="mayor-movement-date">
                                                        {formatearFecha(m.fecha_tsc)}
                                                    </span>
                                                    <span className="mayor-movement-amount">
                                                        {formatearMonto(m.haber)}
                                                    </span>
                                                </div>
                                            )
                                    )}

                                    {saldo < 0 && (
                                        <div className="mayor-final-balance">
                                            <span>Saldo Final</span>
                                            <span>{formatearMonto(Math.abs(saldo))}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}