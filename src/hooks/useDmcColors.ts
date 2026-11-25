import { useEffect, useState } from "react";

import {
  getAllDMCColors,
  type DMCColor,
} from "../services/colorPaletteService";

let cachedColors: DMCColor[] | null = null;
let pendingRequest: Promise<DMCColor[]> | null = null;

export function loadDmcColors(): Promise<DMCColor[]> {
  if (cachedColors) {
    return Promise.resolve(cachedColors);
  }

  if (!pendingRequest) {
    pendingRequest = getAllDMCColors()
      .then((colors) => {
        cachedColors = colors;
        return colors;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }

  return pendingRequest;
}

export function useDmcColors() {
  const [allColors, setAllColors] = useState<DMCColor[]>(cachedColors ?? []);

  const [loading, setLoading] = useState(cachedColors === null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadDmcColors()
      .then((colors) => {
        if (!active) return;

        setAllColors(colors);
        setError("");
      })
      .catch((err) => {
        if (!active) return;

        console.error("Error loading DMC colors:", err);
        setError("Could not load DMC colors.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    allColors,
    loading,
    error,
  };
}
