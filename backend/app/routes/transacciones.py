from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Transaccion, DetalleTransaccion
from ..schemas import TransaccionCreate

router = APIRouter(prefix="/transacciones", tags=["Transacciones"])


def validar_payload_transaccion(payload: TransaccionCreate):
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

    return total_debe, total_haber


@router.post("")
def crear_transaccion(payload: TransaccionCreate, db: Session = Depends(get_db)):
    total_debe, total_haber = validar_payload_transaccion(payload)

    nueva_transaccion = Transaccion(
        fecha_tsc=payload.fecha_tsc,
        glosa=payload.glosa,
        total_debe=total_debe,
        total_haber=total_haber
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


@router.put("/{id_tsc}")
def editar_transaccion(id_tsc: int, payload: TransaccionCreate, db: Session = Depends(get_db)):
    transaccion = db.query(Transaccion).filter(Transaccion.id_tsc == id_tsc).first()

    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    total_debe, total_haber = validar_payload_transaccion(payload)

    transaccion.fecha_tsc = payload.fecha_tsc
    transaccion.glosa = payload.glosa
    transaccion.total_debe = total_debe
    transaccion.total_haber = total_haber

    db.query(DetalleTransaccion).filter(DetalleTransaccion.id_tsc == id_tsc).delete(synchronize_session=False)

    for index, linea in enumerate(payload.lineas, start=1):
        detalle = DetalleTransaccion(
            id_tsc=id_tsc,
            id_cuenta=linea.id_cuenta,
            descripcion_linea=linea.descripcion_linea,
            debe=linea.debe,
            haber=linea.haber,
            orden=index
        )
        db.add(detalle)

    db.commit()

    return {
        "mensaje": "Transacción actualizada correctamente",
        "id_tsc": id_tsc
    }


@router.delete("/{id_tsc}")
def eliminar_transaccion(id_tsc: int, db: Session = Depends(get_db)):
    transaccion = db.query(Transaccion).filter(Transaccion.id_tsc == id_tsc).first()

    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    db.delete(transaccion)
    db.commit()

    return {
        "mensaje": "Transacción eliminada correctamente",
        "id_tsc": id_tsc
    }


@router.delete("")
def eliminar_todas_transacciones(db: Session = Depends(get_db)):
    total = db.query(Transaccion).count()

    if total == 0:
        return {
            "mensaje": "No hay transacciones para eliminar",
            "total_eliminadas": 0
        }

    db.query(Transaccion).delete(synchronize_session=False)
    db.commit()

    return {
        "mensaje": "Todas las transacciones fueron eliminadas correctamente",
        "total_eliminadas": total
    }