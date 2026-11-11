import { useEffect, useState } from "react";

import type { CustomPalette } from "../../types/palette";

import {
  getAllDMCColors,
  createColorPalette,
  type DMCColor,
} from "../../services/colorPaletteService";

import "../../styles/modals/NewProject.css";
import "../../styles/modals/CreatePalette.css";

type CreatePaletteModalProps = {
  onBack: () => void;
  onSave: (palette: CustomPalette) => void;
};

function CreatePaletteModal({ onBack, onSave }: CreatePaletteModalProps) {
  const [paletteName, setPaletteName] = useState("My new palette");
  const [search, setSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [dmcColors, setDmcColors] = useState<DMCColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch DMC colors from Supabase
  useEffect(() => {
    async function loadColors() {
      try {
        const colors = await getAllDMCColors();
        setDmcColors(colors);
      } catch (err) {
        console.error("Error loading DMC colors:", err);
        setError("Could not load DMC colors.");
      } finally {
        setLoading(false);
      }
    }

    loadColors();
  }, []);

  // Filter colors
  const filteredColors = dmcColors.filter((color) => {
    const query = search.toLowerCase().trim();

    return (
      color.code.toLowerCase().includes(query) ||
      color.name.toLowerCase().includes(query)
    );
  });

  // Toggle selected colors
  const toggleColor = (code: string) => {
    setSelectedCodes((previous) =>
      previous.includes(code)
        ? previous.filter((selected) => selected !== code)
        : [...previous, code],
    );
  };

  const selectedColors = dmcColors.filter((color) =>
    selectedCodes.includes(color.code),
  );

  // Save palette to Supabase
  const handleSave = async () => {
    if (!paletteName.trim() || selectedCodes.length === 0 || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const palette = await createColorPalette(
        paletteName.trim(),
        selectedCodes,
      );

      onSave({
        id: String(palette.palette_id),
        name: palette.name,
        colorCodes: selectedCodes,
      });
    } catch (err) {
      console.error("Error creating palette:", err);
      setError("Could not save palette. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="new-project-overlay">
      <div
        className="new-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-palette-title"
      >
        <header className="new-project-header">
          <button
            type="button"
            className="create-palette-back"
            onClick={onBack}
          >
            ← Pattern setup
          </button>

          <h2 id="create-palette-title">Create a color palette</h2>

          <p>Collect the thread colors you want to use in this pattern.</p>

          <button
            type="button"
            className="new-project-close"
            onClick={onBack}
            aria-label="Back to pattern setup"
          >
            ×
          </button>
        </header>

        <div className="new-project-content create-palette-content">
          <div className="create-palette-name-field">
            <label htmlFor="palette-name">Palette name</label>

            <div className="create-palette-name-input">
              <input
                id="palette-name"
                type="text"
                maxLength={40}
                value={paletteName}
                onChange={(event) => setPaletteName(event.target.value)}
                placeholder="My new palette"
              />

              <span>{paletteName.length}/40</span>
            </div>
          </div>

          <div className="create-palette-colors-heading">
            <div>
              <h3>Choose thread colors</h3>
              <p>DMC stranded cotton</p>
            </div>

            <div className="create-palette-search">
              <span className="material-symbols-sharp">search</span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or number"
                aria-label="Search DMC colors"
              />
            </div>
          </div>

          <div className="create-palette-color-grid">
            {loading ? (
              <p>Loading DMC colors...</p>
            ) : (
              filteredColors.map((color) => {
                const isSelected = selectedCodes.includes(color.code);

                return (
                  <button
                    key={color.code}
                    type="button"
                    className={`create-palette-color-card ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => toggleColor(color.code)}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="create-palette-color-swatch"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <span className="material-symbols-sharp">check</span>
                      )}
                    </span>

                    <span className="create-palette-color-info">
                      <strong>DMC {color.code}</strong>
                      <span>{color.name}</span>
                    </span>

                    <span className="create-palette-color-action">
                      <span className="material-symbols-sharp">
                        {isSelected ? "check" : "add"}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {!loading && filteredColors.length === 0 && (
            <p className="create-palette-empty">
              No colors found. Try another search.
            </p>
          )}

          {error && <p className="create-palette-empty">{error}</p>}
        </div>

        <footer className="new-project-footer create-palette-footer">
          <div className="create-palette-selection">
            <div>
              <strong>{selectedCodes.length} colors selected</strong>
              <p>
                {selectedCodes.length > 0
                  ? "Your palette is ready to save"
                  : "Select at least one color"}
              </p>
            </div>

            <div className="create-palette-selected-preview">
              {selectedColors.slice(0, 8).map((color) => (
                <span
                  key={color.code}
                  style={{ backgroundColor: color.hex }}
                  title={`DMC ${color.code}`}
                />
              ))}

              {selectedColors.length > 8 && (
                <span className="create-palette-preview-more">
                  +{selectedColors.length - 8}
                </span>
              )}
            </div>
          </div>

          <div className="create-palette-footer-actions">
            <button
              type="button"
              className="new-project-cancel"
              onClick={onBack}
            >
              CANCEL
            </button>

            <button
              type="button"
              className="new-project-create"
              onClick={handleSave}
              disabled={
                !paletteName.trim() ||
                selectedCodes.length === 0 ||
                saving ||
                loading
              }
            >
              {saving ? "SAVING..." : "SAVE PALETTE"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CreatePaletteModal;
