import { useState } from "react";

import type { Pattern } from "../../types/pattern";

import type {
  DMCColor,
  UserColorPalette,
} from "../../services/colorPaletteService";

import AddColorsModal from "../modals/AddColorsModal";

type ColorPaletteProps = {
  selectedColor: string;
  onColorChange: (color: string) => void;
  pattern: Pattern;

  selectedPaletteId: string;
  onPaletteChange: (paletteId: string) => void;

  allColors: DMCColor[];
  palettes: UserColorPalette[];

  loading: boolean;
  error: string;

  onPalettesUpdated: () => Promise<void>;
  paletteSaving: boolean;
};

function ColorPalette({
  selectedColor,
  onColorChange,
  pattern,
  selectedPaletteId,
  onPaletteChange,
  allColors,
  palettes,
  loading,
  error,
  onPalettesUpdated,
  paletteSaving,
}: ColorPaletteProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("number");

  const [isAddColorsOpen, setIsAddColorsOpen] = useState(false);

  // ACTIVE PALETTE

  const activePalette = palettes.find(
    (palette) => String(palette.palette_id) === selectedPaletteId,
  );

  const activeColors = activePalette ? activePalette.colors : allColors;

  // USED COLORS

  const usedColors = new Set(
    [
      ...pattern.stitches.flat().filter((color) => color !== null),

      ...(pattern.halfStitches ?? []).map((stitch) => stitch.color),

      ...(pattern.backstitches ?? []).map((stitch) => stitch.color),

      ...(pattern.frenchKnots ?? []).map((knot) => knot.color),
    ].map((color) => color.toLowerCase()),
  );

  // FILTER AND SORT

  const displayedColors = [...activeColors]
    .filter((color) => {
      if (filter === "used") {
        return usedColors.has(color.hex.toLowerCase());
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "id") {
        return a.id - b.id;
      }

      return a.code.localeCompare(b.code, undefined, { numeric: true });
    });

  // RENDER

  return (
    <div className="color-palette">
      {/* ACTIVE PALETTE */}

      <div className="palette-header">
        <label htmlFor="active-palette">Active palette</label>

        <select
          id="active-palette"
          value={selectedPaletteId}
          disabled={loading || paletteSaving}
          onChange={(event) => {
            setIsAddColorsOpen(false);
            onPaletteChange(event.target.value);
          }}>
          <option value="all">All DMC colors</option>

          {selectedPaletteId !== "all" && !activePalette && (
            <option value={selectedPaletteId}>
              {loading ? "Loading palette..." : "Unavailable palette"}
            </option>
          )}

          {palettes.map((palette) => (
            <option key={palette.palette_id} value={String(palette.palette_id)}>
              {palette.name}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER AND SORT */}

      <div className="palette-controls">
        <div>
          <label htmlFor="color-filter">Filter</label>

          <select
            id="color-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All colors</option>
            <option value="used">Used colors</option>
          </select>
        </div>

        <div>
          <label htmlFor="color-sort">Sort</label>

          <select
            id="color-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}>
            <option value="number">DMC number</option>
            <option value="id">Color hue</option>
          </select>
        </div>
      </div>

      {/* COLOR GRID */}

      {loading ? (
        <p>Loading colors...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="color-grid">
          {displayedColors.map((color) => (
            <button
              key={color.code}
              type="button"
              className={
                selectedColor.toLowerCase() === color.hex.toLowerCase()
                  ? "color-swatch selected"
                  : "color-swatch"
              }
              onClick={() => onColorChange(color.hex)}
              title={`${color.code} - ${color.name}`}
              aria-label={`Select ${color.name}, DMC ${color.code}`}>
              <span
                className="swatch-inner"
                style={{ backgroundColor: color.hex }}>
                <span className="swatch-code">{color.code}</span>
              </span>
            </button>
          ))}

          {/* ADD COLORS */}

          {activePalette && (
            <button
              type="button"
              className="add-color-button"
              onClick={() => setIsAddColorsOpen(true)}
              title="Add colors">
              +
            </button>
          )}

          {/* ADD COLORS MODAL */}

          {isAddColorsOpen && activePalette && (
            <AddColorsModal
              paletteId={activePalette.palette_id}
              paletteName={activePalette.name}
              existingColorCodes={activePalette.colors.map(
                (color) => color.code,
              )}
              onSaved={onPalettesUpdated}
              onClose={() => setIsAddColorsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPalette;
