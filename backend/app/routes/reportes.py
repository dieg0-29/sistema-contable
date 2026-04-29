from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from ..database import get_db

router = APIRouter(prefix="/reportes", tags=["Reportes"])


# =========================================
# LIBRO DIARIO
# =========================================
@router.get("/libro-diario")
def obtener_libro_diario(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_libro_diario"))
    return [dict(row._mapping) for row in result]


# =========================================
# LIBRO MAYOR
# =========================================
@router.get("/libro-mayor")
def obtener_libro_mayor(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_libro_mayor"))
    return [dict(row._mapping) for row in result]


# =========================================
# BALANCE GENERAL
# =========================================
@router.get("/balance-general")
def obtener_balance_general(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_balance_general"))
    return [dict(row._mapping) for row in result]


# =========================================
# ESTADO DE RESULTADOS
# =========================================
@router.get("/estado-resultados")
def obtener_estado_resultados(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_estado_resultados"))
    return [dict(row._mapping) for row in result]


# =========================================
# BALANCE DE COMPROBACIÓN (JSON)
# =========================================
@router.get("/balance-comprobacion")
def obtener_balance_comprobacion(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT 
            cod_cuenta,
            descp_cuenta,
            SUM(COALESCE(debe, 0)) as total_debe,
            SUM(COALESCE(haber, 0)) as total_haber
        FROM public.v_libro_mayor
        GROUP BY cod_cuenta, descp_cuenta
        ORDER BY cod_cuenta
    """))
    return [dict(row._mapping) for row in result]


# =========================================
# BALANCE DE COMPROBACIÓN (PDF)
# =========================================
@router.get("/balance-comprobacion/pdf")
def exportar_balance_comprobacion_pdf(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT 
            cod_cuenta,
            descp_cuenta,
            SUM(COALESCE(debe, 0)) as total_debe,
            SUM(COALESCE(haber, 0)) as total_haber
        FROM public.v_libro_mayor
        GROUP BY cod_cuenta, descp_cuenta
        ORDER BY cod_cuenta
    """))

    rows = [dict(row._mapping) for row in result]

    datos_con_saldo = []
    total_debe = 0
    total_haber = 0

    for item in rows:
        saldo = float(item["total_debe"] or 0) - float(item["total_haber"] or 0)

        if saldo != 0:
            debe = saldo if saldo > 0 else 0
            haber = abs(saldo) if saldo < 0 else 0

            total_debe += debe
            total_haber += haber

            datos_con_saldo.append([
                item["cod_cuenta"],
                item["descp_cuenta"],
                f"{debe:,.2f}" if debe > 0 else "-",
                f"{haber:,.2f}" if haber > 0 else "-"
            ])

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    elements = []

    # Título
    elements.append(Paragraph("Balance de Comprobación", styles["Title"]))
    elements.append(Spacer(1, 20))

    # Tabla
    data = [
        ["Código", "Descripción", "Debe", "Haber"],
        *datos_con_saldo,
        ["", "TOTALES", f"{total_debe:,.2f}", f"{total_haber:,.2f}"]
    ]

    table = Table(data, colWidths=[80, 350, 120, 120])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#427AB5")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ALIGN", (1, 1), (1, -1), "LEFT"),
        ("ALIGN", (2, 1), (3, -1), "RIGHT"),

        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E5E7EB")),

        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
    ]))

    elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=balance_comprobacion.pdf"
        }
    )

@router.get("/estados-financieros-periodo/pdf")
def exportar_estados_financieros_periodo_pdf(db: Session = Depends(get_db)):
    balance_result = db.execute(text("select * from public.v_balance_general"))
    resultados_result = db.execute(text("select * from public.v_estado_resultados"))

    balance = [dict(row._mapping) for row in balance_result]
    resultados = [dict(row._mapping) for row in resultados_result]

    def format_monto(valor):
        return f"{float(valor or 0):,.2f}"

    def sum_by_class(data, keyword):
        return sum(
            float(i.get("saldo") or 0)
            for i in data
            if keyword in str(i.get("clasificacion_cuenta", "")).upper()
        )

    def sum_by_code(data, code):
        return sum(
            float(i.get("saldo") or 0)
            for i in data
            if str(i.get("cod_cuenta", "")).startswith(code)
        )

    ventas = sum_by_class(resultados, "INGRESO") - sum_by_class(resultados, "DONACIÓN") - sum_by_code(resultados, "75")
    costo_venta = sum_by_class(resultados, "COSTO")
    gastos_op = sum_by_class(resultados, "GASTO") - sum_by_class(resultados, "PÉRDIDA") - sum_by_code(resultados, "66")
    otros_gastos = sum_by_class(resultados, "PÉRDIDA") + sum_by_code(resultados, "66")
    otros_ingresos = sum_by_class(resultados, "DONACIÓN") + sum_by_code(resultados, "75")

    utilidad_bruta = ventas - costo_venta
    utilidad_operativa = utilidad_bruta - gastos_op
    utilidad_neta = utilidad_operativa - otros_gastos + otros_ingresos

    def es_corriente(item):
        cod = str(item.get("cod_cuenta", ""))
        if cod.startswith("1") and int(cod[:2] or 0) < 19:
            return True
        if cod.startswith("2"):
            return True
        if cod.startswith("4") and int(cod[:2] or 0) < 49:
            return True
        return False

    activo = [i for i in balance if "ACTIVO" in str(i.get("clasificacion_cuenta", "")).upper()]
    pasivo = [i for i in balance if "PASIVO" in str(i.get("clasificacion_cuenta", "")).upper()]
    patrimonio = [
        i for i in balance
        if (
            "PATRIMONIO" in str(i.get("clasificacion_cuenta", "")).upper()
            or "CAPITAL" in str(i.get("clasificacion_cuenta", "")).upper()
        )
        and "ACTIVO" not in str(i.get("clasificacion_cuenta", "")).upper()
        and "PASIVO" not in str(i.get("clasificacion_cuenta", "")).upper()
    ]

    def sum_items(items):
        return sum(float(i.get("saldo") or 0) for i in items)

    activo_corriente = [i for i in activo if es_corriente(i)]
    activo_no_corriente = [i for i in activo if not es_corriente(i)]
    pasivo_corriente = [i for i in pasivo if es_corriente(i)]
    pasivo_no_corriente = [i for i in pasivo if not es_corriente(i)]

    total_activo = sum_items(activo)
    total_pasivo = sum_items(pasivo)
    total_patrimonio = sum_items(patrimonio) + utilidad_neta

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    elements = []

    def crear_tabla(titulo, filas, total_label=None, total=None):
        elements.append(Paragraph(titulo, styles["Heading2"]))
        elements.append(Spacer(1, 8))

        data = [["Cuenta", "Monto"]]

        filas_filtradas = [
            i for i in filas
            if abs(float(i.get("saldo") or 0)) > 0.001
        ]

        if filas_filtradas:
            for item in filas_filtradas:
                data.append([
                    item.get("descp_cuenta", ""),
                    format_monto(item.get("saldo"))
                ])
        else:
            data.append(["Sin movimientos", "-"])

        if total_label is not None:
            data.append([total_label, format_monto(total)])

        table = Table(data, colWidths=[330, 130])

        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#427AB5")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (1, 1), (1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E5E7EB")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 16))

    elements.append(Paragraph("Estados Financieros del Periodo", styles["Title"]))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Estado de Situación Financiera", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    crear_tabla("Activo Corriente", activo_corriente, "TOTAL ACTIVO CORRIENTE", sum_items(activo_corriente))
    crear_tabla("Activo No Corriente", activo_no_corriente, "TOTAL ACTIVO NO CORRIENTE", sum_items(activo_no_corriente))
    crear_tabla("Pasivo Corriente", pasivo_corriente, "TOTAL PASIVO CORRIENTE", sum_items(pasivo_corriente))
    crear_tabla("Pasivo No Corriente", pasivo_no_corriente, "TOTAL PASIVO NO CORRIENTE", sum_items(pasivo_no_corriente))
    crear_tabla("Patrimonio", patrimonio, "TOTAL PATRIMONIO + UTILIDAD", total_patrimonio)

    crear_tabla("Resumen del Estado de Situación Financiera", [
        {"descp_cuenta": "TOTAL ACTIVOS", "saldo": total_activo},
        {"descp_cuenta": "TOTAL PASIVO", "saldo": total_pasivo},
        {"descp_cuenta": "TOTAL PATRIMONIO", "saldo": total_patrimonio},
        {"descp_cuenta": "TOTAL PASIVO Y PATRIMONIO", "saldo": total_pasivo + total_patrimonio},
    ])

    elements.append(Paragraph("Estado de Resultados", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    crear_tabla("Resultados del Periodo", [
        {"descp_cuenta": "VENTAS NETAS", "saldo": ventas},
        {"descp_cuenta": "COSTO DE LA VENTA", "saldo": costo_venta},
        {"descp_cuenta": "UTILIDAD BRUTA", "saldo": utilidad_bruta},
        {"descp_cuenta": "GASTOS OPERATIVOS", "saldo": gastos_op},
        {"descp_cuenta": "UTILIDAD OPERATIVA", "saldo": utilidad_operativa},
        {"descp_cuenta": "OTROS GASTOS", "saldo": otros_gastos},
        {"descp_cuenta": "OTROS INGRESOS", "saldo": otros_ingresos},
        {"descp_cuenta": "UTILIDAD ANTES DE IMPUESTOS", "saldo": utilidad_neta},
    ])

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=estados_financieros_periodo.pdf"
        }
    )