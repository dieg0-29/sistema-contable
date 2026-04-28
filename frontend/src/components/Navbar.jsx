import { FaWallet, FaPlus, FaBook, FaLayerGroup, FaReceipt, FaCalendarAlt } from "react-icons/fa";

export default function Navbar({ vista, setVista }) {
  const registros = [
    { key: 'cuentas',       label: 'Catálogo de Cuentas',   icon: <FaWallet /> },
    { key: 'transacciones', label: 'Nueva Transacción',      icon: <FaPlus /> },
  ]

  const reportes = [
    { key: 'diario',              label: 'Libro Diario',            icon: <FaBook /> },
    { key: 'mayor',               label: 'Libro Mayor',             icon: <FaLayerGroup /> },
    { key: 'balance-comprobacion',label: 'Bal. Comprobación',       icon: <FaReceipt /> },
    { key: 'estados-periodo',     label: 'Estados Financieros',     icon: <FaCalendarAlt /> },
  ]

  const renderItem = (item) => (
    <button
      key={item.key}
      onClick={() => setVista(item.key)}
      className={`navbar-button ${vista === item.key ? 'active' : ''}`}
    >
      <span className="icon">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  )

  return (
    <nav className="sidebar-nav">
      <span className="sidebar-section-label">Registros</span>
      {registros.map(renderItem)}

      <span className="sidebar-section-label">Reportes</span>
      {reportes.map(renderItem)}
    </nav>
  )
}