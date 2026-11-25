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
};

const tools: {
  id: Tool;
  label: string;
  icon: string;
}[] = [
  { id: "pencil", label: "Brush", icon: "edit" },
  { id: "eraser", label: "Eraser", icon: "ink_eraser" },
  { id: "fill", label: "Fill", icon: "format_color_fill" },
  { id: "eyedropper", label: "Pick color", icon: "colorize" },
  { id: "swap", label: "Swap colors", icon: "swap_horiz" },
];

const stitchTools: {
  id: Tool;
  label: string;
  icon: string;
}[] = [
  {
    id: "pencil",
    label: "Full stitch",
    icon: "square",
  },
  {
    id: "half-stitch",
    label: "Half stitch",
    icon: "change_history",
  },
  {
    id: "backstitch",
    label: "Backstitch",
    icon: "show_chart",
  },
  {
    id: "french-knot",
    label: "French knot",
    icon: "circle",
  },
];

const halfStitchDirections: {
  id: HalfStitchDirection;
  label: string;
  icon: string;
}[] = [
  {
    id: "top-left",
    label: "Top left",
    icon: "◤",
  },
  {
    id: "top-right",
    label: "Top right",
    icon: "◥",
  },
  {
    id: "bottom-left",
    label: "Bottom left",
    icon: "◣",
  },
  {
    id: "bottom-right",
    label: "Bottom right",
    icon: "◢",
  },
];

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
    <svg
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true">
      <circle cx="9" cy="10" r="7" fill="#000000" />

      <rect x="21" y="3" width="15" height="15" stroke="#000000" />

      <path d="M21 3H36L21 18Z" fill="#000000" />

      <rect x="2" y="23" width="15" height="15" stroke="#000000" />

      <path d="M2 23H9.5V38H2Z" fill="#000000" />

      <rect x="21" y="23" width="15" height="15" stroke="#000000" />

      <path d="M36 23V38H21Z" fill="#000000" />
    </svg>
  );
}

function Toolbar({
  selectedTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedHalfStitchDirection = "top-left",
  onHalfStitchDirectionChange,
}: ToolbarProps) {
  const [stitchPopupOpen, setStitchPopupOpen] = useState(false);

  const isStitchTool =
    selectedTool === "half-stitch" ||
    selectedTool === "backstitch" ||
    selectedTool === "french-knot";

  // ========================================
  // SELECT STITCH TYPE
  // ========================================

  function selectStitchTool(tool: Tool) {
    onToolChange(tool);
  }

  // ========================================
  // SELECT HALF STITCH DIRECTION
  // ========================================

  function selectDirection(direction: HalfStitchDirection) {
    onHalfStitchDirectionChange?.(direction);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {/* STANDARD TOOLS */}

        {tools.map((tool) => (
          <button
            key={tool.id}
            className={
              selectedTool === tool.id ? "tool-button active" : "tool-button"
            }
            onClick={() => onToolChange(tool.id)}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={selectedTool === tool.id}>
            <span className="tool-icon">
              <MaterialIcon name={tool.icon} />
            </span>
          </button>
        ))}

        {/* STITCH TYPES */}

        <div className="stitch-tool-wrapper">
          <button
            type="button"
            className={
              isStitchTool || stitchPopupOpen
                ? "tool-button active"
                : "tool-button"
            }
            title="Stitch types"
            aria-label="Stitch types"
            aria-expanded={stitchPopupOpen}
            onClick={() => setStitchPopupOpen((open) => !open)}>
            <span className="tool-icon">
              <StitchTypesIcon />
            </span>
          </button>

          {/* STITCH TYPES POPUP */}

          {stitchPopupOpen && (
            <div className="stitch-popup tool-popup">
              {/* POPUP HEADER */}

              <div className="stitch-popup-header tool-popup-header">
                <strong>STITCH TYPES</strong>

                <button
                  type="button"
                  className="stitch-popup-close tool-popup-close"
                  onClick={() => setStitchPopupOpen(false)}
                  aria-label="Close stitch types">
                  <MaterialIcon name="close" size={18} />
                </button>
              </div>

              {/* STITCH OPTIONS */}

              <div className="stitch-popup-options">
                {stitchTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className={`stitch-popup-option tool-popup-option ${
                      selectedTool === tool.id ? "active" : ""
                    }`}
                    aria-pressed={selectedTool === tool.id}
                    onClick={() => selectStitchTool(tool.id)}>
                    <span className="stitch-popup-option-icon">
                      <MaterialIcon name={tool.icon} size={22} />
                    </span>

                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* HALF STITCH DIRECTIONS */}

              {selectedTool === "half-stitch" && (
                <div className="stitch-popup-directions">
                  <span className="stitch-popup-subtitle">DIRECTION</span>

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
                        aria-pressed={
                          selectedHalfStitchDirection === direction.id
                        }
                        onClick={() => selectDirection(direction.id)}>
                        {direction.icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM TOOLS */}

      <div className="toolbar-bottom">
        <button
          className="tool-button"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl/Cmd + Z)"
          aria-label="Undo">
          <span className="tool-icon">
            <MaterialIcon name="undo" />
          </span>
        </button>

        <button
          className="tool-button"
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl/Cmd + Shift + Z)"
          aria-label="Redo">
          <span className="tool-icon">
            <MaterialIcon name="redo" />
          </span>
        </button>

        <button
          className="tool-button"
          type="button"
          title="Settings"
          aria-label="Settings">
          <span className="tool-icon">
            <MaterialIcon name="settings" />
          </span>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
