import { useMemo } from 'react';

export default function EstadosFinancierosPeriodo({ balance, resultados, loading, error }) {
    const formatSoles = (amount) => 
        Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // --- LÓGICA DEL ESTADO DE RESULTADOS (ESCALONADO COMPLETO) ---
    const er = useMemo(() => {
        const sumByClass = (keyword) => 
            resultados
                .filter(i => i.clasificacion_cuenta?.toUpperCase().includes(keyword))
                .reduce((s, i) => s + Number(i.saldo), 0);

        const sumByCode = (code) =>
            resultados
                .filter(i => i.cod_cuenta?.toString().startsWith(code))
                .reduce((s, i) => s + Number(i.saldo), 0);

        const ventas = sumByClass('INGRESO') - sumByClass('DONACIÓN') - sumByCode('75'); // Ingresos operativos netos
        const costoVenta = sumByClass('COSTO'); 
        const gastosOp = sumByClass('GASTO') - sumByClass('PÉRDIDA')- sumByCode('66'); // Gastos operativos (sin pérdidas extra)
        
        // Cuentas específicas que pediste (PÉRDIDA + código 66 pérdidas por medición)
        const otrosGastos = sumByClass('PÉRDIDA') + sumByCode('66');
        const otrosIngresos = sumByClass('DONACIÓN') + sumByCode('75');

        const utilidadBruta = ventas - costoVenta;
        const utilidadOperativa = utilidadBruta - gastosOp;
        
        // Cálculo final incluyendo lo nuevo
        const utilidadNeta = utilidadOperativa - otrosGastos + otrosIngresos;

        return { 
            ventas, 
            costoVenta, 
            utilidadBruta, 
            gastosOp, 
            utilidadOperativa, 
            otrosGastos, 
            otrosIngresos, 
            utilidadNeta 
        };
    }, [resultados]);

    const esf = useMemo(() => construirESF(balance, er.utilidadNeta), [balance, er.utilidadNeta]);

    if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Cargando reportes financieros...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</p>;

    const RenderTableSection = ({ title, items, total, showTotal = true }) => {
        const itemsFiltrados = items.filter(item => Math.abs(Number(item.saldo)) > 0.001);
        return (
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ borderBottom: '2px solid #2d3748', paddingBottom: '8px', fontSize: '1.2rem', color: '#1a202c' }}>{title}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ color: '#718096', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Cuenta</th>
                            <th style={{ textAlign: 'right', padding: '8px' }}>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsFiltrados.length > 0 ? (
                            itemsFiltrados.map((item) => (
                                <tr key={item.id_cuenta} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '8px', fontSize: '0.95rem' }}>{item.descp_cuenta}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>{formatSoles(item.saldo)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" style={{ padding: '15px', color: '#cbd5e0', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>Sin movimientos</td>
                            </tr>
                        )}
                        {showTotal && (
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                <td style={{ padding: '12px', textAlign: 'right' }}>TOTAL {title.toUpperCase()}</td>
                                <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #2d3748' }}>{formatSoles(total)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            
            {/* BALANCE GENERAL */}
            <div className="section-block" style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                <h2 style={{ textAlign: 'center', color: '#2d3748', marginBottom: '40px', fontSize: '1.8rem', textDecoration: 'underline', fontWeight: '800' }}>Estado de Situación Financiera</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                    <div>
                        <h2 style={{ color: '#2b6cb0', fontSize: '1.4rem', fontWeight: 'bold' }}>ACTIVOS</h2>
                        <RenderTableSection title="Activo Corriente" items={esf.activoCorriente} total={esf.totalActivoCorriente} />
                        <RenderTableSection title="Activo No Corriente" items={esf.activoNoCorriente} total={esf.totalActivoNoCorriente} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#2d3748', color: '#fff', borderRadius: '8px', marginTop: '20px' }}>
                            <span style={{ fontWeight: 'bold' }}>TOTAL ACTIVOS</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatSoles(esf.totalActivo)}</span>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ color: '#c53030', fontSize: '1.4rem', fontWeight: 'bold' }}>PASIVOS</h2>
                        <RenderTableSection title="Pasivo Corriente" items={esf.pasivoCorriente} total={esf.totalPasivoCorriente} />
                        <RenderTableSection title="Pasivo No Corriente" items={esf.pasivoNoCorriente} total={esf.totalPasivoNoCorriente} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2.5px double #cbd5e0', marginBottom: '25px', fontWeight: 'bold', color: '#c53030' }}>
                            <span>TOTAL PASIVO</span>
                            <span>{formatSoles(esf.totalPasivo)}</span>
                        </div>
                        <h2 style={{ color: '#2f855a', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '30px' }}>PATRIMONIO</h2>
                        <RenderTableSection title="Patrimonio" items={esf.patrimonioBase} showTotal={false} />
                        <div style={{ padding: '15px', backgroundColor: er.utilidadNeta >= 0 ? '#f0fff4' : '#fff5f5', border: `1px solid ${er.utilidadNeta >= 0 ? '#c6f6d5' : '#fed7d7'}`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>UTILIDAD / PÉRDIDA DEL EJERCICIO</span>
                            <span style={{ fontWeight: 'bold', color: er.utilidadNeta >= 0 ? '#2f855a' : '#c53030' }}>{formatSoles(er.utilidadNeta)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2.5px double #cbd5e0', marginBottom: '25px', fontWeight: 'bold', color: '#2f855a' }}>
                            <span>TOTAL PATRIMONIO</span>
                            <span>{formatSoles(esf.totalPatrimonio)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#2d3748', color: '#fff', borderRadius: '8px', marginTop: '20px' }}>
                            <span style={{ fontWeight: 'bold' }}>TOTAL PASIVO Y PATRIMONIO</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatSoles(esf.totalPasivo + esf.totalPatrimonio)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESTADO DE RESULTADOS */}
            <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '850px', margin: '0 auto', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: '900', textDecoration: 'overline' }}>ESTADO DE RESULTADOS PERIODO</h2>
                    <p style={{ color: '#718096', fontWeight: 'bold', marginTop: '5px' }}></p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '12px' }}>VENTAS NETAS</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>{formatSoles(er.ventas)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '12px' }}>COSTO DE LA VENTA</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>{formatSoles(er.costoVenta)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#fffaf0', fontWeight: 'bold', borderBottom: '2.5px solid #ed8936' }}>
                            <td style={{ padding: '12px' }}>UTILIDAD BRUTA</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatSoles(er.utilidadBruta)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '12px' }}>GASTOS OPERATIVOS</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>{formatSoles(er.gastosOp)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#fffaf0', fontWeight: 'bold', borderBottom: '2.5px solid #ed8936' }}>
                            <td style={{ padding: '12px' }}>UTILIDAD OPERATIVA</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatSoles(er.utilidadOperativa)}</td>
                        </tr>
                        {/* FILAS NUEVAS */}
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '12px' }}>OTROS GASTOS (- PÉRDIDAS)</td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#c53030' }}>{formatSoles(er.otrosGastos)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '12px' }}>OTROS INGRESOS (+ DONACIONES)</td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#2f855a' }}>{formatSoles(er.otrosIngresos)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#2d3748', color: '#fff' }}>
                            <td style={{ padding: '20px', fontWeight: '900', borderRadius: '0 0 0 10px' }}>UTILIDAD ANTES DE IMPUESTOS</td>
                            <td style={{ padding: '20px', textAlign: 'right', fontWeight: '900', fontSize: '1.4rem', borderRadius: '0 0 10px 0' }}>{formatSoles(er.utilidadNeta)}</td>
                        </tr>
                    </tbody>
                </table>
                <p style={{ textAlign: 'right', marginTop: '15px', fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase' }}></p>
            </div>
        </div>
    );
}

function construirESF(balance, utilidadDelPeriodo) {
    const esCorriente = (item) => {
        const cod = item.cod_cuenta?.toString() || "";
        if (cod.startsWith('1') && parseInt(cod.substring(0,2)) < 19) return true;
        if (cod.startsWith('4') && parseInt(cod.substring(0,2)) < 49) return true;
        return false;
    };
    const activo = balance.filter(i => i.clasificacion_cuenta?.toUpperCase().includes('ACTIVO'));
    const pasivo = balance.filter(i => i.clasificacion_cuenta?.toUpperCase().includes('PASIVO'));
    const patrimonioBase = balance.filter(i => {
        const c = i.clasificacion_cuenta?.toUpperCase() || '';
        return (c.includes('PATRIMONIO') || c.includes('CAPITAL')) && !c.includes('ACTIVO') && !c.includes('PASIVO');
    });
    const sum = (arr) => arr.reduce((s, i) => s + Number(i.saldo), 0);
    return {
        activoCorriente: activo.filter(i => esCorriente(i)),
        totalActivoCorriente: sum(activo.filter(i => esCorriente(i))),
        activoNoCorriente: activo.filter(i => !esCorriente(i)),
        totalActivoNoCorriente: sum(activo.filter(i => !esCorriente(i))),
        pasivoCorriente: pasivo.filter(i => esCorriente(i)),
        totalPasivoCorriente: sum(pasivo.filter(i => esCorriente(i))),
        pasivoNoCorriente: pasivo.filter(i => !esCorriente(i)),
        totalPasivoNoCorriente: sum(pasivo.filter(i => !esCorriente(i))),
        patrimonioBase,
        totalPatrimonio: sum(patrimonioBase) + utilidadDelPeriodo,
        totalActivo: sum(activo),
        totalPasivo: sum(pasivo)
    };
}