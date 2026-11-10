import { useState } from "react";
import type { Pattern } from "../../types/pattern";
import dmcColors from "../../data/dmc-colors.json";
import AddColorsModal from "../modals/AddColorsModal";

type ColorPaletteProps = {
  selectedColor: string;
  onColorChange: (color: string) => void;
  pattern: Pattern;
};

const gardenColorCodes = [
  "310",
  "666",
  "699",
  "797",
  "444",
  "740",
  "602",
  "550",
];

const basicColorCodes = ["B5200", "666", "699", "797"];

function ColorPalette({
  selectedColor,
  onColorChange,
  pattern,
}: ColorPaletteProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("number");
  const [palette, setPalette] = useState("garden");
  const [isAddColorsOpen, setIsAddColorsOpen] = useState(false);
  const activeColors = dmcColors.filter((color) => {
    if (palette === "basic") {
      return basicColorCodes.includes(color.code);
    }

    if (palette === "garden") {
      return gardenColorCodes.includes(color.code);
    }

    return true;
  });

  const usedColors = new Set(
    pattern.stitches.flat().filter((color) => color !== null),
  );
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
          value={palette}
          onChange={(event) => setPalette(event.target.value)}>
          <option value="all">All DMC colors</option>
          <option value="garden">Garden favorites</option>
          <option value="basic">Basic colors</option>
        </select>
      </div>

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
            <option value="hue">Color hue</option>
          </select>
        </div>
      </div>

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
            aria-label={`Select ${color.name}, DMC ${color.code}`}>
            <span
              className="swatch-inner"
              style={{ backgroundColor: color.hex }}>
              <span className="swatch-code">{color.code}</span>
            </span>
          </button>
        ))}

        {palette !== "all" && (
          <button
            type="button"
            className="add-color-button"
            onClick={() => setIsAddColorsOpen(true)}
            title="Add colors coming later">
            +
          </button>
        )}
        {isAddColorsOpen && (
          <AddColorsModal
            paletteName={
              palette === "garden" ? "Garden favorites" : "Basic colors"
            }
            existingColorCodes={activeColors.map((color) => color.code)}
            onClose={() => setIsAddColorsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ColorPalette;
