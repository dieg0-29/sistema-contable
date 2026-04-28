import { useMemo } from 'react';

export default function EstadosFinancierosPeriodo({ balance, resultados, loading, error }) {
    const formatSoles = (amount) =>
        Number(amount).toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const er = useMemo(() => {
        const sumByClass = (keyword) =>
            resultados
                .filter(i => i.clasificacion_cuenta?.toUpperCase().includes(keyword))
                .reduce((s, i) => s + Number(i.saldo), 0);

        const sumByCode = (code) =>
            resultados
                .filter(i => i.cod_cuenta?.toString().startsWith(code))
                .reduce((s, i) => s + Number(i.saldo), 0);

        const ventas = sumByClass('INGRESO') - sumByClass('DONACIÓN') - sumByCode('75');
        const costoVenta = sumByClass('COSTO');
        const gastosOp = sumByClass('GASTO') - sumByClass('PÉRDIDA') - sumByCode('66');

        const otrosGastos = sumByClass('PÉRDIDA') + sumByCode('66');
        const otrosIngresos = sumByClass('DONACIÓN') + sumByCode('75');

        const utilidadBruta = ventas - costoVenta;
        const utilidadOperativa = utilidadBruta - gastosOp;
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

    if (loading) return <p className="efp-loading">Cargando reportes financieros...</p>;
    if (error) return <p className="efp-error">{error}</p>;

    const RenderTableSection = ({ title, items, total, showTotal = true }) => {
        const itemsFiltrados = items.filter(item => Math.abs(Number(item.saldo)) > 0.001);

        return (
            <div className="efp-table-section">
                <h3 className="efp-section-title">{title}</h3>

                <table className="efp-table">
                    <thead>
                        <tr className="efp-table-head-row">
                            <th className="efp-th-left">Cuenta</th>
                            <th className="efp-th-right">Monto</th>
                        </tr>
                    </thead>

                    <tbody>
                        {itemsFiltrados.length > 0 ? (
                            itemsFiltrados.map((item) => (
                                <tr key={item.id_cuenta} className="efp-row">
                                    <td className="efp-cell-name">{item.descp_cuenta}</td>
                                    <td className="efp-cell-amount">{formatSoles(item.saldo)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="efp-empty">
                                    Sin movimientos
                                </td>
                            </tr>
                        )}

                        {showTotal && (
                            <tr className="efp-total-row">
                                <td className="efp-total-label">TOTAL {title.toUpperCase()}</td>
                                <td className="efp-total-amount">{formatSoles(total)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="efp-wrapper">

            <div className="section-block efp-card-balance">
                <h2 className="efp-main-title">Estado de Situación Financiera</h2>

                <div className="efp-grid">
                    <div>
                        <h2 className="efp-title-active">ACTIVOS</h2>

                        <RenderTableSection title="Activo Corriente" items={esf.activoCorriente} total={esf.totalActivoCorriente} />
                        <RenderTableSection title="Activo No Corriente" items={esf.activoNoCorriente} total={esf.totalActivoNoCorriente} />

                        <div className="efp-grand-total">
                            <span>TOTAL ACTIVOS</span>
                            <span className="efp-grand-total-amount">{formatSoles(esf.totalActivo)}</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="efp-title-passive">PASIVOS</h2>

                        <RenderTableSection title="Pasivo Corriente" items={esf.pasivoCorriente} total={esf.totalPasivoCorriente} />
                        <RenderTableSection title="Pasivo No Corriente" items={esf.pasivoNoCorriente} total={esf.totalPasivoNoCorriente} />

                        <div className="efp-subtotal efp-subtotal-passive">
                            <span>TOTAL PASIVO</span>
                            <span>{formatSoles(esf.totalPasivo)}</span>
                        </div>

                        <h2 className="efp-title-equity">PATRIMONIO</h2>

                        <RenderTableSection title="Patrimonio" items={esf.patrimonioBase} showTotal={false} />

                        <div className={er.utilidadNeta >= 0 ? 'efp-profit positive' : 'efp-profit negative'}>
                            <span>UTILIDAD / PÉRDIDA DEL EJERCICIO</span>
                            <span className={er.utilidadNeta >= 0 ? 'efp-profit-amount positive' : 'efp-profit-amount negative'}>
                                {formatSoles(er.utilidadNeta)}
                            </span>
                        </div>

                        <div className="efp-subtotal efp-subtotal-equity">
                            <span>TOTAL PATRIMONIO</span>
                            <span>{formatSoles(esf.totalPatrimonio)}</span>
                        </div>

                        <div className="efp-grand-total">
                            <span>TOTAL PASIVO Y PATRIMONIO</span>
                            <span className="efp-grand-total-amount">
                                {formatSoles(esf.totalPasivo + esf.totalPatrimonio)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="efp-card-results">
                <div className="efp-results-header">
                    <h2>ESTADO DE RESULTADOS</h2>
                    <h3>Periodo Actual</h3>
                    <p></p>
                </div>

                <table className="efp-results-table">
                    <tbody>
                        <tr className="efp-row">
                            <td className="efp-results-cell">VENTAS NETAS</td>
                            <td className="efp-results-amount">{formatSoles(er.ventas)}</td>
                        </tr>

                        <tr className="efp-row">
                            <td className="efp-results-cell">COSTO DE LA VENTA</td>
                            <td className="efp-results-amount">{formatSoles(er.costoVenta)}</td>
                        </tr>

                        <tr className="efp-highlight-row">
                            <td className="efp-results-cell">UTILIDAD BRUTA</td>
                            <td className="efp-results-highlight-amount">{formatSoles(er.utilidadBruta)}</td>
                        </tr>

                        <tr className="efp-row">
                            <td className="efp-results-cell">GASTOS OPERATIVOS</td>
                            <td className="efp-results-amount">{formatSoles(er.gastosOp)}</td>
                        </tr>

                        <tr className="efp-highlight-row">
                            <td className="efp-results-cell">UTILIDAD OPERATIVA</td>
                            <td className="efp-results-highlight-amount">{formatSoles(er.utilidadOperativa)}</td>
                        </tr>

                        <tr className="efp-row">
                            <td className="efp-results-cell">OTROS GASTOS (- PÉRDIDAS)</td>
                            <td className="efp-results-other-expense">{formatSoles(er.otrosGastos)}</td>
                        </tr>

                        <tr className="efp-row">
                            <td className="efp-results-cell">OTROS INGRESOS (+ DONACIONES)</td>
                            <td className="efp-results-other-income">{formatSoles(er.otrosIngresos)}</td>
                        </tr>

                        <tr className="efp-final-row">
                            <td className="efp-final-label">UTILIDAD ANTES DE IMPUESTOS</td>
                            <td className="efp-final-amount">{formatSoles(er.utilidadNeta)}</td>
                        </tr>
                    </tbody>
                </table>

                <p className="efp-results-footer"></p>
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