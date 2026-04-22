from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models import Cuenta

router = APIRouter(prefix="/cuentas", tags=["Cuentas"])


@router.get("")
def listar_cuentas(db: Session = Depends(get_db)):
    stmt = (
        select(Cuenta)
        .where(Cuenta.activo == True)
        .order_by(Cuenta.cod_cuenta.asc())
    )
    cuentas = db.execute(stmt).scalars().all()
    return cuentas


@router.get("/movimiento")
def listar_cuentas_movimiento(db: Session = Depends(get_db)):
    stmt = (
        select(Cuenta)
        .where(Cuenta.activo == True, Cuenta.acepta_movimiento == True)
        .order_by(Cuenta.cod_cuenta.asc())
    )
    cuentas = db.execute(stmt).scalars().all()
    return cuentas