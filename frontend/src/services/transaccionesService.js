const API_URL = import.meta.env.VITE_API_URL

export async function guardarTransaccionCompleta({ fecha, glosa, lineas }) {
    const payload = {
        fecha_tsc: fecha,
        glosa,
        lineas: lineas.map((linea) => ({
            id_cuenta: Number(linea.id_cuenta),
            descripcion_linea: linea.descripcion_linea || null,
            debe: Number(linea.debe || 0),
            haber: Number(linea.haber || 0)
        }))
    }

    const response = await fetch(`${API_URL}/transacciones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Error al guardar transacción')
    }

    return data
}

export async function eliminarTransaccion(id_tsc) {
    const response = await fetch(`${API_URL}/transacciones/${id_tsc}`, {
        method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Error al eliminar transacción')
    }

    return data
}

export async function eliminarTodasTransacciones() {
    const response = await fetch(`${API_URL}/transacciones`, {
        method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Error al eliminar transacciones')
    }

    return data
}

export async function editarTransaccion(id_tsc, { fecha, glosa, lineas }) {
    const payload = {
        fecha_tsc: fecha,
        glosa,
        lineas: lineas.map((linea) => ({
            id_cuenta: Number(linea.id_cuenta),
            descripcion_linea: linea.descripcion_linea || null,
            debe: Number(linea.debe || 0),
            haber: Number(linea.haber || 0)
        }))
    }

    const response = await fetch(`${API_URL}/transacciones/${id_tsc}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Error al editar transacción')
    }

    return data
}