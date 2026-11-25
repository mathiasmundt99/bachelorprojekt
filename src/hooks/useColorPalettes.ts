import { useCallback, useEffect, useState } from "react";

import {
  getUserColorPalettes,
  type UserColorPalette,
} from "../services/colorPaletteService";

import { loadDmcColors, useDmcColors } from "./useDmcColors";

export function useColorPalettes() {
  const {
    allColors,
    loading: loadingColors,
    error: colorsError,
  } = useDmcColors();

  const [palettes, setPalettes] = useState<UserColorPalette[]>([]);
  const [loadingPalettes, setLoadingPalettes] = useState(true);
  const [paletteError, setPaletteError] = useState("");

  const loadPalettes = useCallback(async () => {
    try {
      setLoadingPalettes(true);
      setPaletteError("");

      const colors = await loadDmcColors();

      const userPalettes = await getUserColorPalettes(colors);

      setPalettes(userPalettes);
    } catch (err) {
      console.error("Error loading palettes:", err);
      setPaletteError("Could not load color palettes.");
    } finally {
      setLoadingPalettes(false);
    }
  }, []);

  useEffect(() => {
    loadPalettes();
  }, [loadPalettes]);

  return {
    allColors,
    palettes,
    loading: loadingColors || loadingPalettes,
    error: colorsError || paletteError,
    loadPalettes,
  };
}
