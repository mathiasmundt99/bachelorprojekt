import type { Tool } from "../../types/pattern";

type ToolbarProps = {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
};

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: "pencil", label: "Brush", icon: "✎" },
  { id: "eraser", label: "Eraser", icon: "◇" },
  { id: "fill", label: "Fill", icon: "◈" },
  { id: "picker", label: "Pick color", icon: "◩" },
  { id: "move", label: "Move", icon: "✥" },
  { id: "swap", label: "Swap colors", icon: "✥" },
];

function Toolbar({ selectedTool, onToolChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={
              selectedTool === tool.id ? "tool-button active" : "tool-button"
            }
            onClick={() => onToolChange(tool.id)}
            type="button">
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-bottom">
        <button className="tool-button" type="button" disabled>
          <span className="tool-icon">↶</span>
          <span className="tool-label">Undo</span>
        </button>

        <button className="tool-button" type="button" disabled>
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
