const API_URL = import.meta.env.VITE_API_URL

export async function obtenerLibroDiario() {
    const response = await fetch(`${API_URL}/reportes/libro-diario`)
    if (!response.ok) throw new Error('Error al obtener libro diario')
    return await response.json()
}

export async function obtenerLibroMayor() {
    const response = await fetch(`${API_URL}/reportes/libro-mayor`)
    if (!response.ok) throw new Error('Error al obtener libro mayor')
    return await response.json()
}

export async function obtenerBalanceGeneral() {
    const response = await fetch(`${API_URL}/reportes/balance-general`)
    if (!response.ok) throw new Error('Error al obtener balance general')
    return await response.json()
}

export async function obtenerEstadoResultados() {
    const response = await fetch(`${API_URL}/reportes/estado-resultados`)
    if (!response.ok) throw new Error('Error al obtener estado de resultados')
    return await response.json()
}