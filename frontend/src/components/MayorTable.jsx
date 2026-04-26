import { useMemo, useState } from 'react'

export default function MayorTable({ data, loading, error }) {
    const [filtroCuenta, setFiltroCuenta] = useState('')

    // Función interna para formatear fecha a DD/MM/AAAA
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return ''
        const [year, month, day] = fechaStr.split('-')
        return `${day}/${month}/${year}`
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
            return Object.values(grupos).filter(g => g.codigo === filtroCuenta)
        }
        return Object.values(grupos)
    }, [data, filtroCuenta])

    const opcionesFiltro = useMemo(() => {
        const mapa = new Map()
        data.forEach(item => mapa.set(item.cod_cuenta, item.descp_cuenta))
        return Array.from(mapa.entries())
    }, [data])

    if (loading) return <p>Cargando libro mayor...</p>
    if (error) return <p className="error-text">{error}</p>
    if (!data.length) return <p>No hay movimientos.</p>

    return (
        <div className="section-block">
            <h2 style={{ marginBottom: '25px', fontSize: '1.8rem' }}>Libro Mayor</h2>

            <div className="filter-box" style={{ marginBottom: '35px' }}>
                <label style={{ fontSize: '1.1rem' }}>Filtrar por cuenta: </label>
                <select 
                    value={filtroCuenta} 
                    onChange={(e) => setFiltroCuenta(e.target.value)}
                    style={{ fontSize: '1.1rem', padding: '5px 10px', borderRadius: '8px' }}
                >
                    <option value="">Todas</option>
                    {opcionesFiltro.map(([cod, desc]) => (
                        <option key={cod} value={cod}>{cod} - {desc}</option>
                    ))}
                </select>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', 
                gap: '35px' 
            }}>
                {cuentasAgrupadas.map((cuenta) => {
                    const sumaDebe = cuenta.movimientos.reduce((acc, m) => acc + Number(m.debe), 0)
                    const sumaHaber = cuenta.movimientos.reduce((acc, m) => acc + Number(m.haber), 0)
                    const saldo = sumaDebe - sumaHaber

                    return (
                        <div key={cuenta.codigo} style={{ 
                            backgroundColor: '#ffffff', 
                            padding: '30px', 
                            borderRadius: '15px', 
                            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ 
                                textAlign: 'center', 
                                borderBottom: '3px solid #1a202c', 
                                paddingBottom: '15px',
                                marginBottom: '20px',
                                fontWeight: '800',
                                fontSize: '1.3rem',
                                color: '#1a202c'
                            }}>
                                {cuenta.codigo} {cuenta.nombre}
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontWeight: '800', 
                                fontSize: '1rem', 
                                color: '#4a5568',
                                textTransform: 'uppercase',
                                marginBottom: '12px'
                            }}>
                                <span style={{ flex: 1, textAlign: 'center' }}>DEBER</span>
                                <span style={{ flex: 1, textAlign: 'center' }}>HABER</span>
                            </div>

                            <div style={{ display: 'flex' }}>
                                {/* Columna DEBER */}
                                <div style={{ flex: 1, borderRight: '3px solid #1a202c', paddingRight: '20px' }}>
                                    {cuenta.movimientos.map((m, i) => m.debe > 0 && (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '10px' }}>
                                            <span style={{ color: '#718096', fontSize: '0.95rem' }}>{formatearFecha(m.fecha_tsc)}</span>
                                            <span style={{ fontWeight: '600' }}>{Number(m.debe).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                    ))}
                                    {saldo > 0 && (
                                        <div style={{ 
                                            marginTop: '30px', 
                                            borderTop: '2px solid #1a202c', 
                                            paddingTop: '12px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            fontWeight: '800',
                                            fontSize: '1.2rem'
                                        }}>
                                            <span style={{ fontSize: '1rem' }}>Saldo Final</span>
                                            <span>{saldo.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Columna HABER */}
                                <div style={{ flex: 1, paddingLeft: '20px' }}>
                                    {cuenta.movimientos.map((m, i) => m.haber > 0 && (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '10px' }}>
                                            <span style={{ color: '#718096', fontSize: '0.95rem' }}>{formatearFecha(m.fecha_tsc)}</span>
                                            <span style={{ fontWeight: '600' }}>{Number(m.haber).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                    ))}
                                    {saldo < 0 && (
                                        <div style={{ 
                                            marginTop: '30px', 
                                            borderTop: '2px solid #1a202c', 
                                            paddingTop: '12px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            fontWeight: '800',
                                            fontSize: '1.2rem'
                                        }}>
                                            <span style={{ fontSize: '1rem' }}>Saldo Final</span>
                                            <span>{Math.abs(saldo).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
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
