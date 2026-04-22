const API_URL = import.meta.env.VITE_API_URL

export async function obtenerCuentas() {
    const response = await fetch(`${API_URL}/cuentas`)
    if (!response.ok) throw new Error('Error al obtener cuentas')
    return await response.json()
}

export async function obtenerCuentasMovimiento() {
    const response = await fetch(`${API_URL}/cuentas/movimiento`)
    if (!response.ok) throw new Error('Error al obtener cuentas de movimiento')
    return await response.json()
}