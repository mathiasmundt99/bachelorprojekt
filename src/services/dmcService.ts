import { supabase } from "../lib/supabase";

export interface DMCColor {
  dmc_code: string;
  color_name: string;
  hex_code: string;
}

export async function getAllDMCColors(): Promise<DMCColor[]> {
  const { data, error } = await supabase
    .from("dmc_colors")
    .select("*")
    .order("dmc_code", { ascending: true });

  if (error) {
    console.error("Fejl ved hentning af DMC-farver:", error.message);
    throw error;
  }

  return data;
}