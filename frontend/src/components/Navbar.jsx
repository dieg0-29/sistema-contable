import { FaWallet, FaPlus, FaBook, FaLayerGroup, FaChartBar } from "react-icons/fa";

export default function Navbar({ vista, setVista }) {
  const items = [
    { key: 'cuentas', label: 'Cuentas', icon: <FaWallet /> },
    { key: 'transacciones', label: 'Nueva transacción', icon: <FaPlus /> },
    { key: 'diario', label: 'Libro diario', icon: <FaBook /> },
    { key: 'mayor', label: 'Libro mayor', icon: <FaLayerGroup /> },
    { key: 'estados', label: 'Estados financieros', icon: <FaChartBar /> }
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