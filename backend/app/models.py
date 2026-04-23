from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, Numeric, SmallInteger, String, Text, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class Cuenta(Base):
    __tablename__ = "cuentas"

    id_cuenta: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cod_cuenta: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    descp_cuenta: Mapped[str] = mapped_column(String(255), nullable=False)
    clasificacion_cuenta: Mapped[str] = mapped_column(String(20), nullable=False)
    naturaleza_cuenta: Mapped[str] = mapped_column(String(15), nullable=False)
    nivel_cuenta: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    acepta_movimiento: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    cuenta_creacion = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()")
    )


class Transaccion(Base):
    __tablename__ = "transacciones"

    id_tsc: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    numero_operacion: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    fecha_tsc: Mapped[str] = mapped_column(Date, nullable=False)
    glosa: Mapped[str] = mapped_column(Text, nullable=False)
    id_periodo: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    total_debe: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    total_haber: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    estado_tsc: Mapped[str] = mapped_column(String(15), nullable=False, default="registrada")
    tsc_creacion = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()")
    )


from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    TIMESTAMP,
    text
)

from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class DetalleTransaccion(Base):
    __tablename__ = "detalle_transaccion"

    id_detalle: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    id_tsc: Mapped[int] = mapped_column(
        ForeignKey("transacciones.id_tsc", ondelete="CASCADE"),
        nullable=False
    )
    id_cuenta: Mapped[int] = mapped_column(
        ForeignKey("cuentas.id_cuenta", ondelete="RESTRICT"),
        nullable=False
    )
    descripcion_linea: Mapped[str | None] = mapped_column(String(255), nullable=True)
    debe: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    haber: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    orden: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    detalle_creacion = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()")
    )