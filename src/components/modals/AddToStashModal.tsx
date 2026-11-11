import { useEffect, useMemo, useState } from "react";

import dmcColors from "../../data/dmc-colors.json";

import "../../styles/modals/AddToStashModal.css";

type AddToStashModalProps = {
  existingColorCodes: string[];
  onAdd: (codes: string[]) => void;
  onClose: () => void;
};

function AddToStashModal({
  existingColorCodes,
  onAdd,
  onClose,
}: AddToStashModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const existingCodes = useMemo(
    () => new Set(existingColorCodes),
    [existingColorCodes],
  );

  const displayedColors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return dmcColors.filter((color) => {
      if (!term) return true;

      return (
        color.code.toLowerCase().includes(term) ||
        color.name.toLowerCase().includes(term)
      );
    });
  }, [search]);

  const selectedColors = selectedCodes
    .map((code) => dmcColors.find((color) => color.code === code))
    .filter((color) => color !== undefined);

  // ========================================
  // CLOSE ON ESCAPE
  // ========================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // ========================================
  // SELECT / DESELECT COLOR
  // ========================================

  function toggleColor(code: string) {
    if (existingCodes.has(code)) return;

    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className="stash-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}>
      <div
        className="stash-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stash-modal-title">
        {/* HEADER */}
        <header className="stash-modal-header">
          <span className="stash-modal-label">MY INVENTORY</span>

          <button
            type="button"
            className="stash-modal-close"
            onClick={onClose}
            aria-label="Close modal">
            ×
          </button>

          <h2 id="stash-modal-title">Add threads to stash</h2>
        </header>

        {/* CONTENT */}
        <div className="stash-modal-content">
          <div className="stash-modal-content-header">
            <h3>DMC thread library</h3>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or number"
              aria-label="Search DMC thread library"
            />
          </div>

          <div className="stash-modal-library-layout">
            {/* COLOR LIBRARY */}
            <div className="stash-modal-color-grid">
              {displayedColors.map((color) => {
                const isExisting = existingCodes.has(color.code);

                const isSelected = selectedCodes.includes(color.code);

                return (
                  <div
                    key={color.code}
                    className={`stash-modal-color-card ${
                      isExisting ? "is-existing" : ""
                    } ${isSelected ? "is-new" : ""}`}>
                    <div
                      className="stash-modal-color-preview"
                      style={{
                        backgroundColor: color.hex,
                      }}
                    />

                    <div className="stash-modal-color-info">
                      <strong>DMC {color.code}</strong>
                      <span title={color.name}>{color.name}</span>
                    </div>

                    <button
                      type="button"
                      className="stash-modal-color-action"
                      onClick={() => toggleColor(color.code)}
                      disabled={isExisting}
                      aria-label={
                        isExisting
                          ? `DMC ${color.code} already in stash`
                          : isSelected
                            ? `Remove DMC ${color.code} from selection`
                            : `Select DMC ${color.code}`
                      }
                      title={
                        isExisting
                          ? "Already in stash"
                          : isSelected
                            ? "Remove from selection"
                            : "Add to selection"
                      }>
                      {isExisting ? "✓" : isSelected ? "−" : "+"}
                    </button>
                  </div>
                );
              })}

              {displayedColors.length === 0 && (
                <p className="stash-modal-no-results">
                  No matching DMC colors found.
                </p>
              )}
            </div>

            {/* SELECTED COLORS */}
            <aside className="stash-modal-selected-panel">
              <h3>Selected threads ({selectedCodes.length})</h3>

              {selectedColors.length === 0 ? (
                <p className="stash-modal-empty-selection">
                  No threads selected yet.
                </p>
              ) : (
                <div className="stash-modal-selected-list">
                  {selectedColors.map((color) => (
                    <div key={color.code} className="stash-modal-selected-item">
                      <span
                        className="stash-modal-selected-preview"
                        style={{
                          backgroundColor: color.hex,
                        }}
                      />

                      <span className="stash-modal-selected-code">
                        DMC {color.code}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleColor(color.code)}
                        aria-label={`Remove DMC ${color.code}`}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="stash-modal-footer">
          <div>
            <h3>Choose new threads</h3>

            <p>Threads already in your stash are marked.</p>
          </div>

          <button
            type="button"
            className="stash-modal-cancel"
            onClick={onClose}>
            CANCEL
          </button>

          <button
            type="button"
            className="stash-modal-add"
            onClick={() => onAdd(selectedCodes)}
            disabled={selectedCodes.length === 0}>
            ADD TO STASH
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddToStashModal;
