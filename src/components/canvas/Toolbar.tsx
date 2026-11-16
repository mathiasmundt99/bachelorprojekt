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
  { id: "pencil", label: "Brush", icon: "✎" },
  { id: "eraser", label: "Eraser", icon: "◇" },
  { id: "fill", label: "Fill", icon: "◈" },
  { id: "eyedropper", label: "Pick color", icon: "◩" },
  { id: "move", label: "Move", icon: "✥" },
  { id: "swap", label: "Swap colors", icon: "⇄" },

  { id: "half-stitch", label: "Half stitch", icon: "◩" },
  { id: "backstitch", label: "Backstitch", icon: "╱" },
  { id: "french-knot", label: "French knot", icon: "●" },
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
  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {tools.map((tool) => (
          <div key={tool.id}>
            <button
              className={
                selectedTool === tool.id ? "tool-button active" : "tool-button"
              }
              onClick={() => onToolChange(tool.id)}
              type="button"
              aria-pressed={selectedTool === tool.id}>
              <span className="tool-icon">{tool.icon}</span>

              <span className="tool-label">{tool.label}</span>
            </button>

            {tool.id === "half-stitch" && selectedTool === "half-stitch" && (
              <div
                className="half-stitch-directions"
                aria-label="Half stitch direction">
                {halfStitchDirections.map((direction) => (
                  <button
                    key={direction.id}
                    type="button"
                    title={direction.label}
                    aria-label={direction.label}
                    aria-pressed={selectedHalfStitchDirection === direction.id}
                    className={`half-stitch-direction-button ${
                      selectedHalfStitchDirection === direction.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => onHalfStitchDirectionChange?.(direction.id)}>
                    {direction.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="toolbar-bottom">
        <button
          className="tool-button"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl/Cmd + Z)">
          <span className="tool-icon">↶</span>
          <span className="tool-label">Undo</span>
        </button>

        <button
          className="tool-button"
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl/Cmd + Shift + Z)">
          <span className="tool-icon">↷</span>
          <span className="tool-label">Redo</span>
        </button>

        <button className="tool-button" type="button">
          <span className="tool-icon">⚙</span>
          <span className="tool-label">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
