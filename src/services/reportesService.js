import { supabase } from '../lib/supabase'

export async function obtenerLibroDiario() {
    const { data, error } = await supabase
        .from('v_libro_diario')
        .select('*')

    if (error) throw error
    return data || []
}

export async function obtenerLibroMayor() {
    const { data, error } = await supabase
        .from('v_libro_mayor')
        .select('*')

    if (error) throw error
    return data || []
}

export async function obtenerSaldosCuentas() {
    const { data, error } = await supabase
        .from('v_saldos_cuentas')
        .select('*')

    if (error) throw error
    return data || []
}

export async function obtenerBalanceGeneral() {
    const { data, error } = await supabase
        .from('v_balance_general')
        .select('*')

    if (error) throw error
    return data || []
}

export async function obtenerEstadoResultados() {
    const { data, error } = await supabase
        .from('v_estado_resultados')
        .select('*')

    if (error) throw error
    return data || []
}