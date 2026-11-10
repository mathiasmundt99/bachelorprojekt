import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Toolbar from "../components/canvas/Toolbar";
import ColorPalette from "../components/canvas/ColorPalette";
import PatternCanvas from "../components/canvas/PatternCanvas";

import type { Pattern, Tool } from "../types/pattern";

import "../styles/CanvasPage.css";

// Opretter et tomt mønster med den valgte størrelse
function createEmptyPattern(width: number, height: number): Pattern {
  return {
    width,
    height,
    stitches: Array.from({ length: height }, () => Array(width).fill(null)),
  };
}

// Indstillinger sendt fra NewProjectModal
type ProjectSettings = {
  width: number;
  height: number;
  fabricCount: number;
  fabricColor: string;
  selectedPalette: string;
};

function CanvasPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hent indstillinger fra NewProjectModal
  const projectSettings = location.state as ProjectSettings | null;

  // Brug valgte mål eller standardstørrelse
  const width = projectSettings?.width ?? 30;
  const height = projectSettings?.height ?? 30;

  // Valgt værktøj
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  // Valgt trådfarve
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Opret mønster med korrekt bredde og højde
  const [pattern, setPattern] = useState<Pattern>(() =>
    createEmptyPattern(width, height),
  );

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}>
          ← Back to home
        </button>

        <h1>Cross Stitch Studio</h1>

        <div className="save-status">
          <span className="save-indicator" />
          <span>All changes saved</span>
        </div>

        <button type="button" className="next-button">
          › Done / Next
        </button>
      </header>

      {/* EDITOR */}
      <div className="editor-layout">
        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">
          <Toolbar selectedTool={selectedTool} onToolChange={setSelectedTool} />
        </aside>

        {/* CANVAS */}
        <main className="canvas-area">
          <PatternCanvas
            pattern={pattern}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            onPatternChange={setPattern}
            onColorChange={setSelectedColor}
            onToolChange={setSelectedTool}
          />
        </main>

        {/* RIGHT SIDEBAR */}
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

export default CanvasPage;
