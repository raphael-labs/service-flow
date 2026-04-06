// src/lib/getEmpresaId.ts

import { supabase } from "@/lib/supabase";

export async function getEmpresaId() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();

  return data?.empresa_id;
}