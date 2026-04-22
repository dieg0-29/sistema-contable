from datetime import date
from pydantic import BaseModel
from typing import Optional, List


class CuentaOut(BaseModel):
    id_cuenta: int
    cod_cuenta: str
    descp_cuenta: str
    clasificacion_cuenta: str
    naturaleza_cuenta: str
    nivel_cuenta: int
    acepta_movimiento: bool
    activo: bool

    class Config:
        from_attributes = True


class DetalleTransaccionIn(BaseModel):
    id_cuenta: int
    descripcion_linea: Optional[str] = None
    debe: float = 0
    haber: float = 0


class TransaccionCreate(BaseModel):
    numero_operacion: str
    fecha_tsc: date
    detalle: str
    lineas: List[DetalleTransaccionIn]


class TransaccionResponse(BaseModel):
    mensaje: str
    id_tsc: int


class LibroDiarioOut(BaseModel):
    id_tsc: int
    numero_operacion: str
    fecha_tsc: date
    detalle: str
    id_cuenta: int
    cod_cuenta: str
    descp_cuenta: str
    id_detalle: int
    descripcion_linea: Optional[str] = None
    debe: float
    haber: float
    orden: int


class LibroMayorOut(BaseModel):
    id_cuenta: int
    cod_cuenta: str
    descp_cuenta: str
    id_tsc: int
    numero_operacion: str
    fecha_tsc: date
    detalle: str
    id_detalle: int
    descripcion_linea: Optional[str] = None
    debe: float
    haber: float
    orden: int


class SaldoCuentaOut(BaseModel):
    id_cuenta: int
    cod_cuenta: str
    descp_cuenta: str
    clasificacion_cuenta: str
    naturaleza_cuenta: str
    total_debe: float
    total_haber: float
    saldo: float