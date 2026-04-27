import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import CuentasTable from './components/CuentasTable'
import TransaccionForm from './components/TransaccionForm'
import DiarioTable from './components/DiarioTable'
import MayorTable from './components/MayorTable'
import EstadosFinancieros from './components/EstadosFinancieros'
import { obtenerCuentas } from './services/cuentasService'
import {
  obtenerBalanceGeneral,
  obtenerEstadoResultados,
  obtenerLibroDiario,
  obtenerLibroMayor
} from './services/reportesService'

function App() {
  const [vista, setVista] = useState('cuentas')

  const [cuentas, setCuentas] = useState([])
  const [diario, setDiario] = useState([])
  const [mayor, setMayor] = useState([])
  const [balance, setBalance] = useState([])
  const [resultados, setResultados] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        const data = await obtenerLibroDiario()
        setDiario(data)
      }

      if (vistaActual === 'mayor') {
        const data = await obtenerLibroMayor()
        setMayor(data)
      }

      if (vistaActual === 'estados') {
        const [dataBalance, dataResultados] = await Promise.all([
          obtenerBalanceGeneral(),
          obtenerEstadoResultados()
        ])

        setBalance(dataBalance)
        setResultados(dataResultados)
      }
    } catch (err) {
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

    if (vista === 'estados') {
      const [dataBalance, dataResultados] = await Promise.all([
        obtenerBalanceGeneral(),
        obtenerEstadoResultados()
      ])

      setBalance(dataBalance)
      setResultados(dataResultados)
    }
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Sistema Contable</h1>

      <Navbar vista={vista} setVista={setVista} />

      {vista === 'cuentas' && (
        <CuentasTable cuentas={cuentas} loading={loading} error={error} />
      )}

      {vista === 'transacciones' && (
        <TransaccionForm onGuardado={recargarReportes} />
      )}

      {vista === 'diario' && (
        <DiarioTable data={diario} loading={loading} error={error} />
      )}

      {vista === 'mayor' && (
        <MayorTable data={mayor} loading={loading} error={error} />
      )}

      {vista === 'estados' && (
        <EstadosFinancieros
          balance={balance}
          resultados={resultados}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}

export default App