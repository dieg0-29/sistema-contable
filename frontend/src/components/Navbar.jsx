import { FaWallet, FaPlus, FaBook, FaLayerGroup, FaReceipt, FaChartBar, FaCalendarAlt } from "react-icons/fa";

export default function Navbar({ vista, setVista }) {
  const items = [
    { key: 'cuentas', label: 'Cuentas', icon: <FaWallet /> },
    { key: 'transacciones', label: 'Nueva transacción', icon: <FaPlus /> },
    { key: 'diario', label: 'Libro diario', icon: <FaBook /> },
    { key: 'mayor', label: 'Libro mayor', icon: <FaLayerGroup /> },
    { key: 'balance-comprobacion', label: 'Balance de comprobación', icon: <FaReceipt /> },
    { key: 'estados-periodo', label: 'Estados por periodo', icon: <FaCalendarAlt /> }
  ]

  return (
    <div className="navbar">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => setVista(item.key)}
          className={`navbar-button ${vista === item.key ? 'active' : ''}`}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}