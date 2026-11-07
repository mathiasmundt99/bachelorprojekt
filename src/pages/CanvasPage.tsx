import { useState } from "react";
import Toolbar from "../components/canvas/Toolbar";
import ColorPalette from "../components/canvas/ColorPalette";
import PatternCanvas from "../components/canvas/PatternCanvas";
import type { Pattern, Tool } from "../types/pattern";
import "../styles/CanvasPage.css";

const WIDTH = 30;
const HEIGHT = 30;

function createEmptyPattern(width: number, height: number): Pattern {
  return {
    width,
    height,
    stitches: Array.from({ length: height }, () => Array(width).fill(null)),
  };
}

function HomePage() {
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  const [selectedColor, setSelectedColor] = useState("#000000");

  const [pattern, setPattern] = useState<Pattern>(() =>
    createEmptyPattern(WIDTH, HEIGHT),
  );

  return (
    <div className="app">
      <header className="app-header">
        <button className="back-button">← Back to home</button>

        <h1>Cross Stitch Studio</h1>

        <div className="save-status">
          <span className="save-indicator" />
          <span>All changes saved</span>
        </div>

        <button className="next-button">› Done / Next</button>
      </header>

      <div className="editor-layout">
        <aside className="left-sidebar">
          <Toolbar selectedTool={selectedTool} onToolChange={setSelectedTool} />
        </aside>

        <main className="canvas-area">
          <PatternCanvas
            pattern={pattern}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            onPatternChange={setPattern}
          />
        </main>

        <aside className="right-sidebar">
          <ColorPalette
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            pattern={pattern}
          />
        </aside>
      </div>
    </div>
  );
}

export default HomePage;
