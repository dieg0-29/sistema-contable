from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/libro-diario")
def obtener_libro_diario(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_libro_diario"))
    return [dict(row._mapping) for row in result]


@router.get("/libro-mayor")
def obtener_libro_mayor(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_libro_mayor"))
    return [dict(row._mapping) for row in result]


@router.get("/balance-general")
def obtener_balance_general(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_balance_general"))
    return [dict(row._mapping) for row in result]


@router.get("/estado-resultados")
def obtener_estado_resultados(db: Session = Depends(get_db)):
    result = db.execute(text("select * from public.v_estado_resultados"))
    return [dict(row._mapping) for row in result]


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