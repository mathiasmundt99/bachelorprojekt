import { useState } from "react";

import type { HalfStitchDirection, Tool } from "../../types/pattern";

type ToolbarProps = {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;

  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  selectedHalfStitchDirection?: HalfStitchDirection;
  onHalfStitchDirectionChange?: (direction: HalfStitchDirection) => void;

  settingsOpen: boolean;
  onSettingsClick: () => void;

  imageToolOpen: boolean;
  onImageToolClick: () => void;

  isResizing: boolean;
  isImageDragging: boolean;
};

// ========================================
// TOOLS
// ========================================

const tools: {
  id: Tool;
  label: string;
  icon: string;
}[] = [
  { id: "pencil", label: "Brush", icon: "edit" },
  { id: "eraser", label: "Eraser", icon: "ink_eraser" },
  { id: "fill", label: "Fill", icon: "format_color_fill" },
  { id: "eyedropper", label: "Eyedropper", icon: "colorize" },
  { id: "swap", label: "Swap colors", icon: "swap_horiz" },
];

const stitchTools: {
  id: Tool;
  label: string;
  icon: string;
}[] = [
  { id: "pencil", label: "Full stitch", icon: "square" },
  { id: "half-stitch", label: "Half stitch", icon: "change_history" },
  { id: "backstitch", label: "Backstitch", icon: "show_chart" },
  { id: "french-knot", label: "French knot", icon: "circle" },
];

const halfStitchDirections: {
  id: HalfStitchDirection;
  label: string;
  symbol: string;
}[] = [
  { id: "top-left", label: "Top left", symbol: "◤" },
  { id: "top-right", label: "Top right", symbol: "◥" },
  { id: "bottom-left", label: "Bottom left", symbol: "◣" },
  { id: "bottom-right", label: "Bottom right", symbol: "◢" },
];

// ========================================
// ICONS
// ========================================

function MaterialIcon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className="material-symbols-sharp"
      style={{ fontSize: size }}
      aria-hidden="true">
      {name}
    </span>
  );
}

function StitchTypesIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="13"
        height="13"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      <path d="M23 4H36V17Z" fill="currentColor" />

      <path d="M4 36L17 23" stroke="currentColor" strokeWidth="2.5" />

      <circle
        cx="29.5"
        cy="29.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

// ========================================
// TOOLBAR
// ========================================

function Toolbar({
  selectedTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedHalfStitchDirection = "top-left",
  onHalfStitchDirectionChange,
  settingsOpen,
  onSettingsClick,
  imageToolOpen,
  onImageToolClick,
  isResizing,
  isImageDragging,
}: ToolbarProps) {
  const [stitchPopupOpen, setStitchPopupOpen] = useState(false);

  const toolsDisabled = isResizing || isImageDragging;

  const isStitchTool =
    selectedTool === "half-stitch" ||
    selectedTool === "backstitch" ||
    selectedTool === "french-knot";

  function selectTool(tool: Tool) {
    setStitchPopupOpen(false);
    onToolChange(tool);
  }

  function selectStitchTool(tool: Tool) {
    onToolChange(tool);
  }

  function selectDirection(direction: HalfStitchDirection) {
    onHalfStitchDirectionChange?.(direction);
  }

  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {/* DRAWING TOOLS */}

        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`tool-button ${
              selectedTool === tool.id && !imageToolOpen && !isResizing
                ? "active"
                : ""
            }`}
            title={tool.label}
            aria-label={tool.label}
            disabled={toolsDisabled}
            onClick={() => selectTool(tool.id)}>
            <span className="tool-icon">
              <MaterialIcon name={tool.icon} />
            </span>
          </button>
        ))}

        {/* STITCH TYPES */}

        <div className="stitch-tool-wrapper">
          <button
            type="button"
            className={`tool-button ${
              !imageToolOpen && !isResizing && (isStitchTool || stitchPopupOpen)
                ? "active"
                : ""
            }`}
            title="Stitch types"
            aria-label="Stitch types"
            aria-expanded={stitchPopupOpen && !imageToolOpen}
            disabled={toolsDisabled}
            onClick={() => {
              if (imageToolOpen || settingsOpen) {
                onToolChange(selectedTool);
                setStitchPopupOpen(true);
              } else {
                setStitchPopupOpen((current) => !current);
              }
            }}>
            <span className="tool-icon">
              <StitchTypesIcon />
            </span>
          </button>

          {stitchPopupOpen && !imageToolOpen && !settingsOpen && (
            <div className="stitch-popup tool-popup">
              <div className="stitch-popup-header tool-popup-header">
                <strong>STITCH TYPES</strong>

                <button
                  type="button"
                  className="stitch-popup-close tool-popup-close"
                  title="Close stitch types"
                  aria-label="Close stitch types"
                  onClick={() => setStitchPopupOpen(false)}>
                  <MaterialIcon name="close" />
                </button>
              </div>

              <div className="stitch-popup-options">
                {stitchTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className={`stitch-popup-option tool-popup-option ${
                      selectedTool === tool.id ? "active" : ""
                    }`}
                    onClick={() => selectStitchTool(tool.id)}>
                    <span className="stitch-popup-option-icon">
                      <MaterialIcon name={tool.icon} />
                    </span>

                    {tool.label}
                  </button>
                ))}
              </div>

              {selectedTool === "half-stitch" && (
                <div className="stitch-popup-directions">
                  <h4 className="stitch-popup-subtitle">DIRECTION</h4>

                  <div className="stitch-popup-direction-grid">
                    {halfStitchDirections.map((direction) => (
                      <button
                        key={direction.id}
                        type="button"
                        className={`stitch-popup-direction ${
                          selectedHalfStitchDirection === direction.id
                            ? "active"
                            : ""
                        }`}
                        title={direction.label}
                        aria-label={direction.label}
                        onClick={() => selectDirection(direction.id)}>
                        {direction.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* IMAGE TOOL */}

        <button
          type="button"
          className={`tool-button ${imageToolOpen ? "active" : ""}`}
          title="Reference image"
          aria-label="Reference image"
          aria-expanded={imageToolOpen}
          disabled={isImageDragging}
          onClick={() => {
            setStitchPopupOpen(false);
            onImageToolClick();
          }}>
          <span className="tool-icon">
            <MaterialIcon name="image" />
          </span>
        </button>
      </div>

      {/* BOTTOM TOOLS */}

      <div className="toolbar-bottom">
        <button
          type="button"
          className="tool-button"
          title="Undo"
          aria-label="Undo"
          disabled={!canUndo || isImageDragging}
          onClick={onUndo}>
          <span className="tool-icon">
            <MaterialIcon name="undo" />
          </span>
        </button>

        <button
          type="button"
          className="tool-button"
          title="Redo"
          aria-label="Redo"
          disabled={!canRedo || isImageDragging}
          onClick={onRedo}>
          <span className="tool-icon">
            <MaterialIcon name="redo" />
          </span>
        </button>

        <button
          type="button"
          className={`tool-button ${settingsOpen ? "active" : ""}`}
          title="Canvas settings"
          aria-label="Canvas settings"
          aria-expanded={settingsOpen}
          disabled={isImageDragging}
          onClick={() => {
            setStitchPopupOpen(false);
            onSettingsClick();
          }}>
          <span className="tool-icon">
            <MaterialIcon name="settings" />
          </span>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
