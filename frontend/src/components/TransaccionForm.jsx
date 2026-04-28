import { useEffect, useMemo, useState } from 'react'
import CuentaSelect from './CuentaSelect'
import { obtenerCuentasMovimiento } from '../services/cuentasService'
import { guardarTransaccionCompleta } from '../services/transaccionesService'

const lineaBase = {
  id_cuenta: '',
  descripcion_linea: '',
  debe: '',
  haber: ''
}

export default function TransaccionForm({ onGuardado }) {
  const [cuentas, setCuentas] = useState([])
  const [loadingCuentas, setLoadingCuentas] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fecha: '',
    glosa: '',
    lineas: [{ ...lineaBase }, { ...lineaBase }]
  })

  useEffect(() => {
    cargarCuentas()
  }, [])

  async function cargarCuentas() {
    try {
      setLoadingCuentas(true)
      const data = await obtenerCuentasMovimiento()
      setCuentas(data)
    } catch (err) {
      setError(err.message || 'Error al cargar cuentas')
    } finally {
      setLoadingCuentas(false)
    }
  }

  function actualizarCampo(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function actualizarLinea(index, campo, valor) {
    const nuevasLineas = [...form.lineas]
    nuevasLineas[index][campo] = valor

    if (campo === 'debe' && valor !== '') {
      nuevasLineas[index].haber = ''
    }

    if (campo === 'haber' && valor !== '') {
      nuevasLineas[index].debe = ''
    }

    setForm((prev) => ({
      ...prev,
      lineas: nuevasLineas
    }))
  }

  function agregarLinea() {
    setForm((prev) => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaBase }]
    }))
  }

  function eliminarLinea(index) {
    if (form.lineas.length <= 2) return

    setForm((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index)
    }))
  }

  const totalDebe = useMemo(() => {
    return form.lineas.reduce((acc, item) => acc + Number(item.debe || 0), 0)
  }, [form.lineas])

  const totalHaber = useMemo(() => {
    return form.lineas.reduce((acc, item) => acc + Number(item.haber || 0), 0)
  }, [form.lineas])

  const cuadra = totalDebe > 0 && totalDebe === totalHaber

  function validar() {
    if (!form.fecha) return 'Selecciona una fecha'
    if (!form.glosa.trim()) return 'Ingresa la glosa'

    for (let i = 0; i < form.lineas.length; i++) {
      const linea = form.lineas[i]
      const debe = Number(linea.debe || 0)
      const haber = Number(linea.haber || 0)

      if (!linea.id_cuenta) {
        return `Selecciona una cuenta en la línea ${i + 1}`
      }

      if (debe <= 0 && haber <= 0) {
        return `Ingresa un monto en debe o haber en la línea ${i + 1}`
      }

      if (debe > 0 && haber > 0) {
        return `Solo puede haber debe o haber en la línea ${i + 1}`
      }
    }

    if (!cuadra) return 'La transacción no cuadra'

    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensaje('')
    setError('')

    const errorValidacion = validar()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setGuardando(true)

      await guardarTransaccionCompleta({
        numeroOperacion: form.numeroOperacion,
        fecha: form.fecha,
        glosa: form.glosa,
        lineas: form.lineas
      })

      setMensaje('Transacción guardada correctamente')
      setForm({
        numeroOperacion: '',
        fecha: '',
        glosa: '',
        lineas: [{ ...lineaBase }, { ...lineaBase }]
      })

      onGuardado?.()
    } catch (err) {
      setError(err.message || 'Error al guardar transacción')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section-block">
      <h2>Nueva transacción</h2>

      <div className="grid-3">
        <div>
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={actualizarCampo}
          />
        </div>

        <div>
          <label htmlFor="glosa">Glosa</label>
          <input
            id="glosa"
            type="text"
            name="glosa"
            value={form.glosa}
            onChange={actualizarCampo}
          />
        </div>
      </div>

      {loadingCuentas ? (
        <p>Cargando cuentas...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Descripción</th>
                <th>Debe</th>
                <th>Haber</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {form.lineas.map((linea, index) => (
                <tr key={index}>
                  <td>
                    <CuentaSelect
                      cuentas={cuentas}
                      value={linea.id_cuenta}
                      onChange={(e) =>
                        actualizarLinea(index, 'id_cuenta', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={linea.descripcion_linea}
                      onChange={(e) =>
                        actualizarLinea(index, 'descripcion_linea', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="no-spinner"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={linea.debe}
                      onChange={(e) =>
                        actualizarLinea(index, 'debe', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="no-spinner"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={linea.haber}
                      onChange={(e) =>
                        actualizarLinea(index, 'haber', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => eliminarLinea(index)}
                      className="danger-button"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="actions-row">
        <button
          type="button"
          onClick={agregarLinea}
          className="secondary-button"
        >
          Agregar línea
        </button>

        <strong>Total Debe: {totalDebe.toFixed(2)}</strong>
        <strong>Total Haber: {totalHaber.toFixed(2)}</strong>

        <strong className={cuadra ? 'status-ok' : 'status-bad'}>
          {cuadra ? 'Cuadra' : 'No cuadra'}
        </strong>
      </div>

      {mensaje && <p className="success-text">{mensaje}</p>}
      {error && <p className="error-text">{error}</p>}

      <button
        type="submit"
        disabled={guardando || !cuadra}
        className="primary-button"
      >
        {guardando ? 'Guardando...' : 'Guardar transacción'}
      </button>
    </form>
  )
}