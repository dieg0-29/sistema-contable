export default function CuentaSelect({ cuentas, value, onChange }) {
  return (
    <select value={value} onChange={onChange}>
      <option value="">Selecciona una cuenta</option>

      {cuentas.map((cuenta) => (
        <option key={cuenta.id_cuenta} value={cuenta.id_cuenta}>
          {cuenta.cod_cuenta} - {cuenta.descp_cuenta}
        </option>
      ))}
    </select>
  )
}