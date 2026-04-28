import { useEffect, useState } from 'react'
import { FaChartLine } from 'react-icons/fa'
import Navbar from './components/Navbar'
import CuentasTable from './components/CuentasTable'
import TransaccionForm from './components/TransaccionForm'
import DiarioTable from './components/DiarioTable'
import MayorTable from './components/MayorTable'
import BalanceComprobacionTable from './components/BalanceComprobacionTable'
import EstadosFinancierosPeriodo from './components/EstadosFinancierosPeriodo';
import { obtenerCuentas, obtenerCuentasMovimiento } from './services/cuentasService'
import {
  obtenerBalanceGeneral,
  obtenerEstadoResultados,
  obtenerLibroDiario,
  obtenerLibroMayor,
  obtenerBalanceComprobacion
} from './services/reportesService'
import {
  editarTransaccion,
  eliminarTodasTransacciones,
  eliminarTransaccion
} from './services/transaccionesService'

const VISTA_LABELS = {
  cuentas:              'Catálogo de Cuentas',
  transacciones:        'Nueva Transacción',
  diario:               'Libro Diario',
  mayor:                'Libro Mayor',
  'balance-comprobacion': 'Balance de Comprobación',
  'estados-periodo':    'Estados Financieros',
}

function App() {
  const [vista, setVista] = useState('cuentas')

  const [cuentas, setCuentas] = useState([])
  const [cuentasMovimiento, setCuentasMovimiento] = useState([])
  const [diario, setDiario] = useState([])
  const [mayor, setMayor] = useState([])
  const [balance, setBalance] = useState([])
  const [resultados, setResultados] = useState([])
  const [balanceComprobacion, setBalanceComprobacion] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deletingAll, setDeletingAll] = useState(false)

  useEffect(() => {
    cargarVista(vista)
  }, [vista])

  async function cargarVista(vistaActual) {
    try {
      setLoading(true)
      setError('')

      if (vistaActual === 'cuentas') {
        const data = await obtenerCuentas()
        setCuentas(data)
      }

      if (vistaActual === 'diario') {
        const [data, dataCuentasMovimiento] = await Promise.all([
          obtenerLibroDiario(),
          obtenerCuentasMovimiento()
        ])
        setDiario(data)
        setCuentasMovimiento(dataCuentasMovimiento)
      }

      if (vistaActual === 'mayor') {
        const data = await obtenerLibroMayor()
        setMayor(data)
      }

      if (vistaActual === 'balance-comprobacion') {
        const data = await obtenerBalanceComprobacion()
        setBalanceComprobacion(data)
      }

      if (vistaActual === 'estados') {
        const [dataBalance, dataResultados] = await Promise.all([
          obtenerBalanceGeneral(),
          obtenerEstadoResultados()
        ])

        setBalance(dataBalance)
        setResultados(dataResultados)
      }

      if (vistaActual === 'estados-periodo') {
        const [dataBalance, dataResultados] = await Promise.all([
          obtenerBalanceGeneral(),
          obtenerEstadoResultados()
        ])

        setBalance(dataBalance)
        setResultados(dataResultados)
      }

      } catch (err){
      setError(err.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  async function recargarReportes() {
    if (vista === 'diario') {
      const data = await obtenerLibroDiario()
      setDiario(data)
    }

    if (vista === 'mayor') {
      const data = await obtenerLibroMayor()
      setMayor(data)
    }

    if (vista === 'balance-comprobacion') {
      const data = await obtenerBalanceComprobacion()
      setBalanceComprobacion(data)
    }

    if (vista === 'estados') {
      const [dataBalance, dataResultados] = await Promise.all([
        obtenerBalanceGeneral(),
        obtenerEstadoResultados()
      ])

      setBalance(dataBalance)
      setResultados(dataResultados)
    }
  }

  async function manejarEliminarTransaccion(id_tsc) {
    try {
      setDeletingId(id_tsc)
      setError('')
      await eliminarTransaccion(id_tsc)
      await recargarReportes()
      if (vista === 'diario') {
        const data = await obtenerLibroDiario()
        setDiario(data)
      }
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la transacción')
    } finally {
      setDeletingId(null)
    }
  }

  async function manejarEliminarTodo() {
    try {
      setDeletingAll(true)
      setError('')
      await eliminarTodasTransacciones()
      await recargarReportes()
      if (vista === 'diario') {
        const data = await obtenerLibroDiario()
        setDiario(data)
      }
    } catch (err) {
      setError(err.message || 'No se pudieron eliminar las transacciones')
    } finally {
      setDeletingAll(false)
    }
  }

  async function manejarEditarTransaccion(id_tsc, payload) {
    try {
      setError('')
      await editarTransaccion(id_tsc, payload)
      await recargarReportes()
      if (vista === 'diario') {
        const data = await obtenerLibroDiario()
        setDiario(data)
      }
    } catch (err) {
      setError(err.message || 'No se pudo editar la transacción')
      throw err
    }
  }

  return (
    <div className="app-shell">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <FaChartLine />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">SisContable</span>
            <span className="sidebar-brand-subtitle">Sistema Contable</span>
          </div>
        </div>

        <Navbar vista={vista} setVista={setVista} />

        <div className="sidebar-footer">
          Grupo 2 &copy; 2025
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-content">
        <header className="main-header">
          <div className="main-header-dot" />
          <h1 className="main-header-title">{VISTA_LABELS[vista]}</h1>
          <span className="main-header-breadcrumb">Sistema Contable</span>
        </header>

        <main className="page-content">
          {vista === 'cuentas' && (
            <CuentasTable cuentas={cuentas} loading={loading} error={error} />
          )}

          {vista === 'transacciones' && (
            <TransaccionForm onGuardado={recargarReportes} />
          )}

          {vista === 'diario' && (
            <DiarioTable
              data={diario}
              cuentas={cuentasMovimiento}
              loading={loading}
              error={error}
              deletingId={deletingId}
              deletingAll={deletingAll}
              onEliminarTransaccion={manejarEliminarTransaccion}
              onEliminarTodo={manejarEliminarTodo}
              onEditarTransaccion={manejarEditarTransaccion}
            />
          )}

          {vista === 'mayor' && (
            <MayorTable data={mayor} loading={loading} error={error} />
          )}

          {vista === 'balance-comprobacion' && (
            <BalanceComprobacionTable data={balanceComprobacion} loading={loading} error={error} />
          )}

          {vista === 'estados-periodo' && (
            <EstadosFinancierosPeriodo
              balance={balance}
              resultados={resultados}
              loading={loading}
              error={error}
            />
          )}
        </main>
      </div>

    </div>
  )
}

export default App