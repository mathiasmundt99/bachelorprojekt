import { useState } from "react";
import CreatePaletteModal from "./CreatePaletteModal";
import dmcColors from "../../data/dmc-colors.json";
import type { CustomPalette } from "../../types/palette";

import "../../styles/modals/NewProject.css";

type NewProjectModalProps = {
  onClose: () => void;
};

const fabricCounts = [11, 14, 16, 18];

const fabricColors = [
  { name: "Antique White", hex: "#F5F0E6" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Cream", hex: "#F5E6C8" },
  { name: "Natural", hex: "#D9C7A5" },
  { name: "Light Blue", hex: "#D7E9F0" },
  { name: "Black", hex: "#292929" },
];

// Midlertidige eksempelpaletter
const paletteOptions = [
  {
    id: "all",
    name: "All thread colors",
    description: "All available DMC colors",
    colors: ["#f04f98", "#ffca45", "#d7f46a", "#a6d8f0"],
  },
  {
    id: "garden",
    name: "Garden favorites",
    description: "Saved palette · 12 colors",
    colors: ["#e86b8b", "#8bbf77", "#f2c96d", "#a98ac7"],
  },
];

function NewProjectModal({ onClose }: NewProjectModalProps) {
  // PATTERN SIZE
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(80);

  // FABRIC
  const [fabricCount, setFabricCount] = useState(14);
  const [fabricColor, setFabricColor] = useState("Antique White");

  // COLOR PALETTE
  const [selectedPalette, setSelectedPalette] = useState("all");

  // Paletter oprettet af brugeren
  const [customPalettes, setCustomPalettes] = useState<CustomPalette[]>([]);

  // Styrer om CreatePaletteModal vises
  const [isCreatingPalette, setIsCreatingPalette] = useState(false);

  // BEREGNING AF STØRRELSE I CM
  const widthInCm = (width / fabricCount) * 2.54;
  const heightInCm = (height / fabricCount) * 2.54;

  // GEM EN NY PALETTE
  const handlePaletteSave = (palette: CustomPalette) => {
    setCustomPalettes((previous) => [...previous, palette]);

    // Vælg automatisk den nye palette
    setSelectedPalette(palette.id);

    // Gå tilbage til Pattern setup
    setIsCreatingPalette(false);
  };

  // KOMBINÉR EKSEMPELPALetter OG NYE PALETTER
  const allPaletteOptions = [
    ...paletteOptions,

    ...customPalettes.map((palette) => ({
      id: palette.id,
      name: palette.name,
      description: `Custom palette · ${palette.colorCodes.length} colors`,

      colors: palette.colorCodes.slice(0, 4).map((code) => {
        const dmcColor = dmcColors.find((color) => color.code === code);

        return dmcColor?.hex ?? "#ffffff";
      }),
    })),
  ];

  // VIS CREATE PALETTE MODAL
  if (isCreatingPalette) {
    return (
      <CreatePaletteModal
        onBack={() => setIsCreatingPalette(false)}
        onSave={handlePaletteSave}
      />
    );
  }

  return (
    <div className="new-project-overlay">
      <div
        className="new-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title">
        {/* HEADER */}
        <header className="new-project-header">
          <span className="new-project-label">NEW PROJECT</span>

          <button
            type="button"
            className="new-project-close"
            onClick={onClose}
            aria-label="Close modal">
            ×
          </button>

          <h2 id="new-project-title">Set up your pattern</h2>

          <p>You can change these details later.</p>
        </header>

        {/* CONTENT */}
        <div className="new-project-content">
          {/* 01 - PATTERN SIZE */}
          <section className="new-project-section">
            <div className="new-project-section-heading">
              <span className="new-project-section-number">01</span>

              <h3>Pattern size</h3>
            </div>

            <p className="new-project-section-description">
              Choose the dimensions of your new pattern.
            </p>

            <div className="pattern-size-fields">
              <div className="pattern-size-field">
                <label htmlFor="pattern-width">WIDTH (STITCHES)</label>

                <input
                  id="pattern-width"
                  type="number"
                  min="1"
                  step="1"
                  value={width}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setWidth(Math.max(1, Math.round(value)));
                  }}
                />
              </div>

              <div className="pattern-size-field">
                <label htmlFor="pattern-height">HEIGHT (STITCHES)</label>

                <input
                  id="pattern-height"
                  type="number"
                  min="1"
                  step="1"
                  value={height}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setHeight(Math.max(1, Math.round(value)));
                  }}
                />
              </div>
            </div>

            {/* SIZE CALCULATOR */}
            <div className="pattern-size-calculator">
              <span className="material-symbols-sharp">calculate</span>

              <div>
                <strong>Size calculator</strong>

                <p>
                  {width} × {height} stitches ={" "}
                  <strong>
                    {widthInCm.toFixed(1)} × {heightInCm.toFixed(1)} cm
                  </strong>{" "}
                  on {fabricCount} count fabric
                </p>
              </div>
            </div>
          </section>

          {/* 02 - FABRIC */}
          <section className="new-project-section fabric-section">
            <div className="new-project-section-heading">
              <span className="new-project-section-number">02</span>

              <h3>Fabric</h3>
            </div>

            <p className="new-project-section-description">
              Select your fabric count and base color.
            </p>

            <h4 className="fabric-label">FABRIC COUNT</h4>

            <div className="fabric-count-options">
              {fabricCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`fabric-count-option ${
                    fabricCount === count ? "selected" : ""
                  }`}
                  onClick={() => setFabricCount(count)}
                  aria-pressed={fabricCount === count}>
                  <strong>{count}</strong>
                  <span>COUNT</span>
                </button>
              ))}
            </div>

            <h4 className="fabric-label">FABRIC COLOR</h4>

            <div className="fabric-color-options">
              {fabricColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={`fabric-color-option ${
                    fabricColor === color.name ? "selected" : ""
                  }`}
                  style={{
                    backgroundColor: color.hex,
                  }}
                  onClick={() => setFabricColor(color.name)}
                  aria-label={color.name}
                  aria-pressed={fabricColor === color.name}
                  title={color.name}>
                  {fabricColor === color.name && (
                    <span className="fabric-color-check">✓</span>
                  )}
                </button>
              ))}
            </div>

            <p className="fabric-selected-color">
              Selected: <strong>{fabricColor}</strong>
            </p>
          </section>

          {/* 03 - COLOR PALETTE */}
          <section className="new-project-section palette-section">
            <div className="new-project-section-heading">
              <span className="new-project-section-number">03</span>

              <h3>Color palette</h3>
            </div>

            <p className="new-project-section-description">
              Start with every color, or one of your saved sets.
            </p>

            <div className="new-project-palette-options">
              {allPaletteOptions.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  className={`new-project-palette-option ${
                    selectedPalette === palette.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPalette(palette.id)}
                  aria-pressed={selectedPalette === palette.id}>
                  <span className="new-project-palette-radio">
                    {selectedPalette === palette.id && (
                      <span className="new-project-palette-radio-dot" />
                    )}
                  </span>

                  <span className="new-project-palette-info">
                    <strong>{palette.name}</strong>
                    <span>{palette.description}</span>
                  </span>

                  <span className="new-project-palette-preview">
                    {palette.colors.map((color, index) => (
                      <span
                        key={index}
                        className="new-project-palette-swatch"
                        style={{
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </span>
                </button>
              ))}
            </div>

            {/* CREATE NEW PALETTE */}
            <button
              type="button"
              className="new-project-palette-add"
              onClick={() => setIsCreatingPalette(true)}>
              + Create a new palette
            </button>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="new-project-footer">
          <button
            type="button"
            className="new-project-cancel"
            onClick={onClose}>
            CANCEL
          </button>

          <button type="button" className="new-project-create" disabled>
            CREATE PATTERN →
          </button>
        </footer>
      </div>
    </div>
  );
}

export default NewProjectModal;
