
import { supabase } from "../lib/supabase";

export interface DMCColor {
  code: string;
  name: string;
  hex: string;
}

export interface PaletteColor {
  code: string;
  name: string;
  hex: string;
}

export interface UserColorPalette {
  palette_id: number;
  name: string;
  colors: PaletteColor[];
}

// Fetch all DMC colors
export const getAllDMCColors = async (): Promise<DMCColor[]> => {
  const { data, error } = await supabase
    .from("dmc_colors")
    .select("dmc_code, color_name, hex_code")
    .order("dmc_code");

  if (error) throw error;

  return (data ?? []).map((color) => ({
    code: color.dmc_code,
    name: color.color_name,
    hex: color.hex_code,
  }));
};

// Fetch user's color palettes
export const getUserColorPalettes = async (): Promise<UserColorPalette[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data: palettes, error: paletteError } = await supabase
    .from("color_palettes")
    .select("palette_id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (paletteError) throw paletteError;

  if (!palettes?.length) return [];

  const paletteIds = palettes.map((palette) => palette.palette_id);

  const { data: paletteColors, error: colorsError } = await supabase
    .from("palette_colors")
    .select("palette_id, dmc_code")
    .in("palette_id", paletteIds);

  if (colorsError) throw colorsError;

  const dmcCodes = [
    ...new Set((paletteColors ?? []).map((color) => color.dmc_code)),
  ];

  if (!dmcCodes.length) {
    return palettes.map((palette) => ({
      ...palette,
      colors: [],
    }));
  }

  const { data: dmcColors, error: dmcError } = await supabase
    .from("dmc_colors")
    .select("dmc_code, color_name, hex_code")
    .in("dmc_code", dmcCodes);

  if (dmcError) throw dmcError;

  return palettes.map((palette) => ({
    ...palette,
    colors: (paletteColors ?? [])
      .filter((color) => color.palette_id === palette.palette_id)
      .map((color) => {
        const dmc = dmcColors?.find(
          (item) => item.dmc_code === color.dmc_code,
        );

        if (!dmc) return null;

        return {
          code: dmc.dmc_code,
          name: dmc.color_name,
          hex: dmc.hex_code,
        };
      })
      .filter((color): color is PaletteColor => color !== null),
  }));
};

// Add colors to a palette
export const addColorsToPalette = async (
  paletteId: number,
  colorCodes: string[],
): Promise<void> => {
  const { data: existing, error: fetchError } = await supabase
    .from("palette_colors")
    .select("dmc_code")
    .eq("palette_id", paletteId);

  if (fetchError) throw fetchError;

  const existingCodes = new Set(
    (existing ?? []).map((color) => color.dmc_code),
  );

  const newColors = colorCodes
    .filter((code) => !existingCodes.has(code))
    .map((code) => ({
      palette_id: paletteId,
      dmc_code: code,
    }));

  if (newColors.length === 0) return;

  const { error } = await supabase
    .from("palette_colors")
    .insert(newColors);

  if (error) throw error;
};

// Create a new color palette
export const createColorPalette = async (
  name: string,
  colorCodes: string[],
): Promise<{ palette_id: number; name: string }> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not authenticated");

  // Create palette
  const { data: palette, error: paletteError } = await supabase
    .from("color_palettes")
    .insert({
      user_id: user.id,
      name,
    })
    .select("palette_id, name")
    .single();

  if (paletteError) throw paletteError;

  // Add selected colors
  const { error: colorsError } = await supabase
    .from("palette_colors")
    .insert(
      colorCodes.map((code) => ({
        palette_id: palette.palette_id,
        dmc_code: code,
      })),
    );

  if (colorsError) {
    await supabase
      .from("color_palettes")
      .delete()
      .eq("palette_id", palette.palette_id);

    throw colorsError;
  }

  return palette;
};
