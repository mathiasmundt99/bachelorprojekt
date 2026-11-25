import { supabase } from "../lib/supabase";

export interface DMCColor {
  id: number;
  code: string;
  name: string;
  hex: string;
}

export type PaletteColor = DMCColor;

export interface UserColorPalette {
  palette_id: number;
  name: string;
  colors: PaletteColor[];
}

// FETCH ALL DMC COLORS

export const getAllDMCColors = async (): Promise<DMCColor[]> => {
  const { data, error } = await supabase
    .from("dmc_colors")
    .select("color_id, dmc_code, color_name, hex_code")
    .order("dmc_code");

  if (error) throw error;

  return (data ?? []).map((color) => ({
    id: color.color_id,
    code: color.dmc_code,
    name: color.color_name,
    hex: color.hex_code,
  }));
};

// FETCH USER COLOR PALETTES

export const getUserColorPalettes = async (
  allColors?: DMCColor[],
): Promise<UserColorPalette[]> => {
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

  if (!paletteColors?.length) {
    return palettes.map((palette) => ({
      ...palette,
      colors: [],
    }));
  }

  const dmcColors = allColors ?? (await getAllDMCColors());

  const colorsByCode = new Map(dmcColors.map((color) => [color.code, color]));

  return palettes.map((palette) => ({
    ...palette,

    colors: paletteColors
      .filter((color) => color.palette_id === palette.palette_id)
      .flatMap((color): PaletteColor[] => {
        const dmc = colorsByCode.get(color.dmc_code);

        return dmc ? [dmc] : [];
      }),
  }));
};

// ADD COLORS TO PALETTE

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

  const newColors = [...new Set(colorCodes)]
    .filter((code) => !existingCodes.has(code))
    .map((code) => ({
      palette_id: paletteId,
      dmc_code: code,
    }));

  if (newColors.length === 0) return;

  const { error } = await supabase.from("palette_colors").insert(newColors);

  if (error) throw error;
};

// CREATE COLOR PALETTE

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

  const { data: palette, error: paletteError } = await supabase
    .from("color_palettes")
    .insert({
      user_id: user.id,
      name,
    })
    .select("palette_id, name")
    .single();

  if (paletteError) throw paletteError;

  if (colorCodes.length === 0) {
    return palette;
  }

  const { error: colorsError } = await supabase.from("palette_colors").insert(
    [...new Set(colorCodes)].map((code) => ({
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
