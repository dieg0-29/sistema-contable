from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Transaccion, DetalleTransaccion
from ..schemas import TransaccionCreate

router = APIRouter(prefix="/transacciones", tags=["Transacciones"])


@router.post("")
def crear_transaccion(payload: TransaccionCreate, db: Session = Depends(get_db)):
    total_debe = sum(linea.debe for linea in payload.lineas)
    total_haber = sum(linea.haber for linea in payload.lineas)

    if total_debe <= 0 or total_haber <= 0:
        raise HTTPException(status_code=400, detail="Debe y haber deben ser mayores a cero")

    if round(total_debe, 2) != round(total_haber, 2):
        raise HTTPException(status_code=400, detail="La transacción no cuadra")

    for i, linea in enumerate(payload.lineas, start=1):
        if linea.debe > 0 and linea.haber > 0:
            raise HTTPException(status_code=400, detail=f"Solo puede haber debe o haber en la línea {i}")
        if linea.debe <= 0 and linea.haber <= 0:
            raise HTTPException(status_code=400, detail=f"Debes ingresar un monto en la línea {i}")

    nueva_transaccion = Transaccion(
        numero_operacion=payload.numero_operacion,
        fecha_tsc=payload.fecha_tsc,
        detalle=payload.detalle
    )

    db.add(nueva_transaccion)
    db.flush()

    for index, linea in enumerate(payload.lineas, start=1):
        detalle = DetalleTransaccion(
            id_tsc=nueva_transaccion.id_tsc,
            id_cuenta=linea.id_cuenta,
            descripcion_linea=linea.descripcion_linea,
            debe=linea.debe,
            haber=linea.haber,
            orden=index
        )
        db.add(detalle)

    db.commit()
    db.refresh(nueva_transaccion)

    return {
        "mensaje": "Transacción registrada correctamente",
        "id_tsc": nueva_transaccion.id_tsc
    }