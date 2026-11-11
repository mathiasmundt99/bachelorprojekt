import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Toolbar from "../components/canvas/Toolbar";
import ColorPalette from "../components/canvas/ColorPalette";
import PatternCanvas from "../components/canvas/PatternCanvas";
import SwapToolPanel from "../components/canvas/SwapToolPanel";

import { usePatternHistory } from "../hooks/usePatternHistory";
import { swapColors } from "../utils/canvas/swapColors";

import type { Pattern, Tool } from "../types/pattern";

import "../styles/CanvasPage.css";

function createEmptyPattern(width: number, height: number): Pattern {
  return {
    width,
    height,
    stitches: Array.from({ length: height }, () => Array(width).fill(null)),
  };
}

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

  const projectSettings = location.state as ProjectSettings | null;

  const width = projectSettings?.width ?? 30;
  const height = projectSettings?.height ?? 30;

  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [selectedColor, setSelectedColor] = useState("#000000");

  // ========================================
  // PATTERN HISTORY
  // ========================================

  const {
    pattern,
    setPattern,
    beginStroke,
    endStroke,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePatternHistory(createEmptyPattern(width, height));

  // ========================================
  // SWAP TOOL STATE
  // ========================================

  const [swapFromColor, setSwapFromColor] = useState<string | null>(null);

  const [swapToColor, setSwapToColor] = useState<string | null>(null);

  // ========================================
  // CHANGE TOOL
  // ========================================

  function handleToolChange(tool: Tool) {
    setSelectedTool(tool);

    setSwapFromColor(null);
    setSwapToColor(null);
  }

  // ========================================
  // SELECT COLOR FROM CANVAS
  // ========================================

  function handleSwapFromColor(color: string) {
    setSwapFromColor(color);
    setSwapToColor(null);
  }

  // ========================================
  // SELECT COLOR FROM PALETTE
  // ========================================

  function handlePaletteColorChange(color: string) {
    if (selectedTool !== "swap") {
      setSelectedColor(color);
      return;
    }

    if (!swapFromColor) return;

    setSwapToColor(color);

    setPattern((currentPattern) =>
      swapColors(currentPattern, swapFromColor, color),
    );
  }

  // ========================================
  // RESET SWAP
  // ========================================

  function handleResetSwap() {
    setSwapFromColor(null);
    setSwapToColor(null);
  }

  return (
    <div className="app">
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

      <div className="editor-layout">
        <aside className="left-sidebar">
          <Toolbar
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </aside>

        <main className="canvas-area">
          <PatternCanvas
            pattern={pattern}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            onPatternChange={setPattern}
            onColorChange={setSelectedColor}
            onToolChange={handleToolChange}
            onSwapColorSelect={handleSwapFromColor}
            onStrokeStart={beginStroke}
            onStrokeEnd={endStroke}
          />

          {selectedTool === "swap" && (
            <SwapToolPanel
              fromColor={swapFromColor}
              toColor={swapToColor}
              onReset={handleResetSwap}
            />
          )}
        </main>

        <aside className="right-sidebar">
          <ColorPalette
            selectedColor={selectedColor}
            onColorChange={handlePaletteColorChange}
            pattern={pattern}
          />
        </aside>
      </div>
    </div>
  );
}

export default CanvasPage;
