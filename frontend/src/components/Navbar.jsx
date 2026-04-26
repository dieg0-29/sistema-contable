export default function Navbar({ vista, setVista }) {
  const items = [
    { key: 'cuentas', label: 'Cuentas' },
    { key: 'transacciones', label: 'Nueva transacción' },
    { key: 'diario', label: 'Libro diario' },
    { key: 'mayor', label: 'Libro mayor' },
    { key: 'estados', label: 'Estados financieros' },
    { key: 'esf-er', label: 'ESF y Estado de Resultados' }
  ]

  return (
    <div className="navbar">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => setVista(item.key)}
          className={`navbar-button ${vista === item.key ? 'active' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}