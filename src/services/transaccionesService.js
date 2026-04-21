import { supabase } from '../lib/supabase'

export async function crearTransaccion(cabecera) {
    const { data, error } = await supabase
        .from('transacciones')
        .insert([cabecera])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function crearDetalleTransaccion(detalles) {
    const { data, error } = await supabase
        .from('detalle_transaccion')
        .insert(detalles)
        .select()

    if (error) throw error
    return data
}

export async function guardarTransaccionCompleta({ numeroOperacion, fecha, detalle, lineas }) {
    const totalDebe = lineas.reduce((acc, item) => acc + Number(item.debe || 0), 0)
    const totalHaber = lineas.reduce((acc, item) => acc + Number(item.haber || 0), 0)

    if (totalDebe <= 0 || totalHaber <= 0) {
        throw new Error('Debe y haber deben ser mayores a cero')
    }

    if (totalDebe !== totalHaber) {
        throw new Error('La transacción no cuadra')
    }

    const transaccion = await crearTransaccion({
        numero_operacion: numeroOperacion,
        fecha_tsc: fecha,
        detalle
    })

    const detalles = lineas.map((linea, index) => ({
        id_tsc: transaccion.id_tsc,
        id_cuenta: Number(linea.id_cuenta),
        debe: Number(linea.debe || 0),
        haber: Number(linea.haber || 0),
        descripcion_linea: linea.descripcion_linea?.trim() || null,
        orden: index + 1
    }))

    await crearDetalleTransaccion(detalles)

    return transaccion
}