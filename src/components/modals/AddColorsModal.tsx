import { useEffect, useState } from "react";

import "../../styles/modals/AddColors.css";

import {
  getAllDMCColors,
  addColorsToPalette,
  type DMCColor,
} from "../../services/colorPaletteService";

type AddColorsModalProps = {
  paletteId: number;
  paletteName: string;
  existingColorCodes: string[];
  onClose: () => void;
  onSaved: () => void;
};

function AddColorsModal({
  paletteId,
  paletteName,
  existingColorCodes,
  onClose,
  onSaved,
}: AddColorsModalProps) {
  const [colors, setColors] = useState<DMCColor[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch DMC colors
  useEffect(() => {
    async function loadColors() {
      try {
        const data = await getAllDMCColors();
        setColors(data);
      } catch (err) {
        console.error(err);
        setError("Could not load DMC colors.");
      } finally {
        setLoading(false);
      }
    }

    loadColors();
  }, []);

  // Toggle selected colors
  function toggleColor(code: string) {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  // Search colors
  const filteredColors = colors.filter((color) => {
    const query = search.toLowerCase();

    return (
      color.code.toLowerCase().includes(query) ||
      color.name.toLowerCase().includes(query)
    );
  });

  // Save selected colors
  async function handleAddColors() {
    if (selectedCodes.length === 0 || saving) return;

    setSaving(true);
    setError("");

    try {
      await addColorsToPalette(paletteId, selectedCodes);

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not add colors to palette.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="add-colors-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-colors-title"
      >
        <header className="modal-header">
          <span className="modal-palette-name">{paletteName}</span>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

          <h2 id="add-colors-title">Add colors to palette</h2>
        </header>

        <div className="modal-content">
          <div className="modal-content-header">
            <h3>DMC thread library</h3>

            <input
              type="search"
              placeholder="Search name or number"
              aria-label="Search DMC colors"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="modal-library-layout">
            <div className="modal-color-grid">
              {loading ? (
                <p>Loading colors...</p>
              ) : (
                filteredColors.map((color) => {
                  const alreadyAdded = existingColorCodes.includes(color.code);

                  const isSelected = selectedCodes.includes(color.code);

                  return (
                    <div
                      className={`modal-color-card ${
                        alreadyAdded
                          ? "is-existing"
                          : isSelected
                            ? "is-new"
                            : ""
                      }`}
                      key={color.code}
                    >
                      <div
                        className="modal-color-preview"
                        style={{ backgroundColor: color.hex }}
                      />

                      <div className="modal-color-info">
                        <strong>DMC {color.code}</strong>
                        <span>{color.name}</span>
                      </div>

                      <button
                        type="button"
                        className="modal-color-action"
                        disabled={alreadyAdded}
                        onClick={() => toggleColor(color.code)}
                        aria-label={
                          alreadyAdded
                            ? `DMC ${color.code} already in palette`
                            : isSelected
                              ? `Deselect DMC ${color.code}`
                              : `Select DMC ${color.code}`
                        }
                        aria-pressed={alreadyAdded || isSelected}
                      >
                        {alreadyAdded || isSelected ? "✓" : "+"}
                      </button>
                    </div>
                  );
                })
              )}

              {!loading && filteredColors.length === 0 && (
                <p>No colors found.</p>
              )}
            </div>

            <aside className="modal-selected-panel">
              <h3>Selected colors ({selectedCodes.length})</h3>

              {selectedCodes.length === 0 ? (
                <p className="modal-empty-selection">No colors selected yet.</p>
              ) : (
                <div className="modal-selected-list">
                  {selectedCodes.map((code) => {
                    const color = colors.find((item) => item.code === code);

                    if (!color) return null;

                    return (
                      <div className="modal-selected-item" key={code}>
                        <span
                          className="modal-selected-preview"
                          style={{ backgroundColor: color.hex }}
                        />

                        <span className="modal-selected-code">
                          DMC {color.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleColor(code)}
                          aria-label={`Remove DMC ${code} from selection`}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <footer className="modal-footer">
          <div>
            <h3>Choose new colors</h3>
            <p>Colors already in the palette are marked</p>
          </div>

          <button type="button" className="modal-cancel" onClick={onClose}>
            CANCEL
          </button>

          <button
            type="button"
            className="modal-add"
            disabled={selectedCodes.length === 0 || saving || loading}
            onClick={handleAddColors}
          >
            {saving ? "SAVING..." : "ADD COLORS"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddColorsModal;
