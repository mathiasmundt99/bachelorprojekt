import { useEffect, useState } from "react";
import type { Pattern } from "../../types/pattern";
import AddColorsModal from "../modals/AddColorsModal";

import {
  getAllDMCColors,
  getUserColorPalettes,
  type DMCColor,
  type UserColorPalette,
} from "../../services/colorPaletteService";

type ColorPaletteProps = {
  selectedColor: string;
  onColorChange: (color: string) => void;
  pattern: Pattern;
};

function ColorPalette({
  selectedColor,
  onColorChange,
  pattern,
}: ColorPaletteProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("number");

  const [selectedPaletteId, setSelectedPaletteId] = useState("all");

  const [palettes, setPalettes] = useState<UserColorPalette[]>([]);
  const [allColors, setAllColors] = useState<DMCColor[]>([]);

  const [isAddColorsOpen, setIsAddColorsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load palettes and DMC colors
  async function loadPalettes() {
    try {
      setError("");

      const [userPalettes, dmcColors] = await Promise.all([
        getUserColorPalettes(),
        getAllDMCColors(),
      ]);

      setPalettes(userPalettes);
      setAllColors(dmcColors);
    } catch (err) {
      console.error("Error loading color palettes:", err);
      setError("Could not load color palettes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPalettes();
  }, []);

  // Find active palette
  const activePalette = palettes.find(
    (palette) => String(palette.palette_id) === selectedPaletteId,
  );

  // Get active colors
  const activeColors = activePalette ? activePalette.colors : allColors;

  // Get colors used in pattern
  const usedColors = new Set(
    pattern.stitches.flat().filter((color) => color !== null),
  );

  // Filter and sort colors
  const displayedColors = [...activeColors]
    .filter((color) => {
      if (filter === "used") {
        return usedColors.has(color.hex);
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "hue") {
        return 0;
      }

      return a.code.localeCompare(b.code, undefined, {
        numeric: true,
      });
    });

  return (
    <div className="color-palette">
      <div className="palette-header">
        <label htmlFor="active-palette">Active palette</label>

        <select
          id="active-palette"
          value={selectedPaletteId}
          onChange={(event) => setSelectedPaletteId(event.target.value)}
        >
          <option value="all">All DMC colors</option>

          {palettes.map((palette) => (
            <option key={palette.palette_id} value={String(palette.palette_id)}>
              {palette.name}
            </option>
          ))}
        </select>
      </div>

      <div className="palette-controls">
        <div>
          <label htmlFor="color-filter">Filter</label>

          <select
            id="color-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All colors</option>
            <option value="used">Used colors</option>
          </select>
        </div>

        <div>
          <label htmlFor="color-sort">Sort</label>

          <select
            id="color-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="number">DMC number</option>
            <option value="hue">Color hue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading colors...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="color-grid">
          {displayedColors.map((color) => (
            <button
              key={color.code}
              type="button"
              className={
                selectedColor === color.hex
                  ? "color-swatch selected"
                  : "color-swatch"
              }
              onClick={() => onColorChange(color.hex)}
              title={`${color.code} - ${color.name}`}
              aria-label={`Select ${color.name}, DMC ${color.code}`}
            >
              <span
                className="swatch-inner"
                style={{ backgroundColor: color.hex }}
              >
                <span className="swatch-code">{color.code}</span>
              </span>
            </button>
          ))}

          {selectedPaletteId !== "all" && activePalette && (
            <button
              type="button"
              className="add-color-button"
              onClick={() => setIsAddColorsOpen(true)}
              title="Add colors"
            >
              +
            </button>
          )}

          {isAddColorsOpen && activePalette && (
            <AddColorsModal
              paletteId={activePalette.palette_id}
              paletteName={activePalette.name}
              existingColorCodes={activePalette.colors.map(
                (color) => color.code,
              )}
              onSaved={loadPalettes}
              onClose={() => setIsAddColorsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPalette;
