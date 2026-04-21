import { supabase } from "../lib/supabase";

export async function obtenerCuentas() {
    const { data, error } = await supabase
        .from("cuentas")
        .select("*")
        .eq("activo", true)
        .order("cod_cuenta", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function obtenerCuentasMovimiento() {
    const { data, error } = await supabase
        .from("cuentas")
        .select("id_cuenta, cod_cuenta, descp_cuenta")
        .eq("activo", true)
        .eq("acepta_movimiento", true)
        .order("cod_cuenta", { ascending: true });

    if (error) throw error;
    return data || [];
}
