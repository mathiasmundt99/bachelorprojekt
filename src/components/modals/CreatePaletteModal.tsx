import { useState } from "react";
import dmcColors from "../../data/dmc-colors.json";

import type { CustomPalette } from "../../types/palette";

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

  const filteredColors = dmcColors.filter((color) => {
    const query = search.toLowerCase().trim();

    return (
      color.code.toLowerCase().includes(query) ||
      color.name.toLowerCase().includes(query)
    );
  });

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

  const handleSave = () => {
    if (!paletteName.trim() || selectedCodes.length === 0) {
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      name: paletteName.trim(),
      colorCodes: selectedCodes,
    });
  };
  return (
    <div className="new-project-overlay">
      <div
        className="new-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-palette-title">
        <header className="new-project-header">
          <button
            type="button"
            className="create-palette-back"
            onClick={onBack}>
            ← Pattern setup
          </button>

          <h2 id="create-palette-title">Create a color palette</h2>

          <p>Collect the thread colors you want to use in this pattern.</p>

          <button
            type="button"
            className="new-project-close"
            onClick={onBack}
            aria-label="Back to pattern setup">
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
            {filteredColors.map((color) => {
              const isSelected = selectedCodes.includes(color.code);

              return (
                <button
                  key={color.code}
                  type="button"
                  className={`create-palette-color-card ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => toggleColor(color.code)}
                  aria-pressed={isSelected}>
                  <span
                    className="create-palette-color-swatch"
                    style={{ backgroundColor: color.hex }}>
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
            })}
          </div>

          {filteredColors.length === 0 && (
            <p className="create-palette-empty">
              No colors found. Try another search.
            </p>
          )}
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
              onClick={onBack}>
              CANCEL
            </button>

            <button
              type="button"
              className="new-project-create"
              onClick={handleSave}
              disabled={!paletteName.trim() || selectedCodes.length === 0}>
              SAVE PALETTE
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CreatePaletteModal;
