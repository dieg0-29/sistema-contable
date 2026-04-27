import { useMemo, useState } from 'react'
import CuentaSelect from './CuentaSelect'

const lineaBase = {
  id_cuenta: '',
  descripcion_linea: '',
  debe: '',
  haber: ''
}

export default function DiarioTable({
  data,
  cuentas,
  loading,
  error,
  deletingId,
  deletingAll,
  onEliminarTransaccion,
  onEliminarTodo,
  onEditarTransaccion
}) {
  const [editingId, setEditingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    fecha: '',
    glosa: '',
    lineas: [{ ...lineaBase }, { ...lineaBase }]
  })

  const transaccionesAgrupadas = Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.id_tsc]) {
        acc[item.id_tsc] = {
          id_tsc: item.id_tsc,
          fecha_tsc: item.fecha_tsc,
          glosa: item.glosa,
          lineas: []
        }
      }

      acc[item.id_tsc].lineas.push(item)
      return acc
    }, {})
  )

  function formatearFecha(fecha) {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-PE')
  }

  function formatearMonto(monto) {
    return Number(monto).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const totalDebeEdicion = useMemo(() => {
    return editForm.lineas.reduce((acc, item) => acc + Number(item.debe || 0), 0)
  }, [editForm.lineas])

  const totalHaberEdicion = useMemo(() => {
    return editForm.lineas.reduce((acc, item) => acc + Number(item.haber || 0), 0)
  }, [editForm.lineas])

  const cuadraEdicion =
    totalDebeEdicion > 0 &&
    Math.abs(totalDebeEdicion - totalHaberEdicion) < 0.000001

  if (loading) return <p>Cargando libro diario...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!data.length) return <p>No hay movimientos en el libro diario.</p>

  async function confirmarEliminarTransaccion(id_tsc) {
    const confirmado = window.confirm(
      `Se eliminará la transacción #${id_tsc}. Esta acción no se puede deshacer.`
    )
    if (!confirmado) return
    await onEliminarTransaccion(id_tsc)
  }

  async function confirmarEliminarTodo() {
    const texto = window.prompt(
      'Escribe BORRAR para eliminar todas las transacciones del libro diario.'
    )
    if (texto !== 'BORRAR') return
    await onEliminarTodo()
  }

  function iniciarEdicion(transaccion) {
    const lineasOrdenadas = [...transaccion.lineas].sort((a, b) => a.orden - b.orden)

    setEditingId(transaccion.id_tsc)
    setEditError('')
    setEditForm({
      fecha: String(transaccion.fecha_tsc).slice(0, 10),
      glosa: transaccion.glosa || '',
      lineas: lineasOrdenadas.map((linea) => ({
        id_cuenta: String(linea.id_cuenta || ''),
        descripcion_linea: linea.descripcion_linea || '',
        debe: Number(linea.debe) > 0 ? String(linea.debe) : '',
        haber: Number(linea.haber) > 0 ? String(linea.haber) : ''
      }))
    })
  }

  function cancelarEdicion() {
    setEditingId(null)
    setSavingId(null)
    setEditError('')
    setEditForm({
      fecha: '',
      glosa: '',
      lineas: [{ ...lineaBase }, { ...lineaBase }]
    })
  }

  function actualizarCampoEdicion(e) {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function actualizarLineaEdicion(index, campo, valor) {
    const nuevasLineas = [...editForm.lineas]
    nuevasLineas[index][campo] = valor

    if (campo === 'debe' && valor !== '') {
      nuevasLineas[index].haber = ''
    }

    if (campo === 'haber' && valor !== '') {
      nuevasLineas[index].debe = ''
    }

    setEditForm((prev) => ({
      ...prev,
      lineas: nuevasLineas
    }))
  }

  function agregarLineaEdicion() {
    setEditForm((prev) => ({
      ...prev,
      lineas: [...prev.lineas, { ...lineaBase }]
    }))
  }

  function eliminarLineaEdicion(index) {
    if (editForm.lineas.length <= 2) return

    setEditForm((prev) => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index)
    }))
  }

  function validarEdicion() {
    if (!editForm.fecha) return 'Selecciona una fecha'
    if (!editForm.glosa.trim()) return 'Ingresa la glosa'

    for (let i = 0; i < editForm.lineas.length; i++) {
      const linea = editForm.lineas[i]
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

    if (!cuadraEdicion) return 'La transacción no cuadra'

    return null
  }

  async function guardarEdicion(id_tsc) {
    const errorValidacion = validarEdicion()

    if (errorValidacion) {
      setEditError(errorValidacion)
      return
    }

    try {
      setEditError('')
      setSavingId(id_tsc)
      await onEditarTransaccion(id_tsc, {
        fecha: editForm.fecha,
        glosa: editForm.glosa,
        lineas: editForm.lineas
      })
      cancelarEdicion()
    } catch (err) {
      setEditError(err.message || 'No se pudo editar la transacción')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="diario-section">
      <div className="diario-title-block" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div>
          <h2>Libro diario</h2>
          <p>Registro ordenado de operaciones contables</p>
        </div>
        <button
          type="button"
          className="danger-button"
          onClick={confirmarEliminarTodo}
          disabled={deletingAll || !!deletingId}
        >
          {deletingAll ? 'Borrando...' : 'Borrar todo'}
        </button>
      </div>

      <div className="diario-header">
        <div>N°</div>
        <div>Fecha</div>
        <div>Cuenta</div>
        <div>Debe</div>
        <div>Haber</div>
      </div>

      <div className="diario-list">
        {transaccionesAgrupadas.map((transaccion, index) => (
          <div key={transaccion.id_tsc} className="diario-card">
            <div className="diario-index">{index + 1}</div>

            <div className="diario-content">
              {transaccion.lineas.map((linea, idx) => (
                <div
                  key={`${linea.id_tsc}-${linea.id_detalle}-${linea.orden}`}
                  className={`diario-linea ${
                    idx > 0 ? 'diario-linea-secundaria' : 'diario-linea-principal'
                  }`}
                >
                  <div className="diario-fecha">
                    {idx === 0 ? formatearFecha(transaccion.fecha_tsc) : ''}
                  </div>

                  <div className="diario-cuenta">
                    {linea.cod_cuenta} {linea.descp_cuenta}
                  </div>

                  <div className="diario-monto">
                    {Number(linea.debe) > 0 ? formatearMonto(linea.debe) : ''}
                  </div>

                  <div className="diario-monto">
                    {Number(linea.haber) > 0 ? formatearMonto(linea.haber) : ''}
                  </div>
                </div>
              ))}

              <div className="diario-glosa">
                Glosa: {transaccion.glosa}
              </div>

              {editingId === transaccion.id_tsc ? (
                <div className="diario-edit-box">
                  <div className="diario-edit-grid">
                    <div>
                      <label htmlFor={`edit-fecha-${transaccion.id_tsc}`}>Fecha</label>
                      <input
                        id={`edit-fecha-${transaccion.id_tsc}`}
                        type="date"
                        name="fecha"
                        value={editForm.fecha}
                        onChange={actualizarCampoEdicion}
                      />
                    </div>

                    <div>
                      <label htmlFor={`edit-glosa-${transaccion.id_tsc}`}>Glosa</label>
                      <input
                        id={`edit-glosa-${transaccion.id_tsc}`}
                        type="text"
                        name="glosa"
                        value={editForm.glosa}
                        onChange={actualizarCampoEdicion}
                      />
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="diario-edit-table">
                      <thead>
                        <tr>
                          <th>Cuenta</th>
                          <th>Descripción línea</th>
                          <th>Debe</th>
                          <th>Haber</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.lineas.map((linea, idx) => (
                          <tr key={`edit-${transaccion.id_tsc}-${idx}`}>
                            <td>
                              <CuentaSelect
                                cuentas={cuentas}
                                value={linea.id_cuenta}
                                onChange={(e) =>
                                  actualizarLineaEdicion(idx, 'id_cuenta', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={linea.descripcion_linea}
                                onChange={(e) =>
                                  actualizarLineaEdicion(
                                    idx,
                                    'descripcion_linea',
                                    e.target.value
                                  )
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
                                  actualizarLineaEdicion(idx, 'debe', e.target.value)
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
                                  actualizarLineaEdicion(idx, 'haber', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="danger-button"
                                onClick={() => eliminarLineaEdicion(idx)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="actions-row">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={agregarLineaEdicion}
                    >
                      Agregar línea
                    </button>

                    <strong>Total Debe: {totalDebeEdicion.toFixed(2)}</strong>
                    <strong>Total Haber: {totalHaberEdicion.toFixed(2)}</strong>
                    <strong className={cuadraEdicion ? 'status-ok' : 'status-bad'}>
                      {cuadraEdicion ? 'Cuadra' : 'No cuadra'}
                    </strong>
                  </div>

                  {editError && <p className="error-text">{editError}</p>}

                  <div className="diario-action-row">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={cancelarEdicion}
                      disabled={savingId === transaccion.id_tsc}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => guardarEdicion(transaccion.id_tsc)}
                      disabled={savingId === transaccion.id_tsc || !cuadraEdicion}
                    >
                      {savingId === transaccion.id_tsc ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="diario-action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => iniciarEdicion(transaccion)}
                    disabled={deletingAll || !!deletingId || savingId !== null}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => confirmarEliminarTransaccion(transaccion.id_tsc)}
                    disabled={deletingAll || deletingId === transaccion.id_tsc || savingId !== null}
                  >
                    {deletingId === transaccion.id_tsc ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}