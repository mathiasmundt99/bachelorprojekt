import { useRef, useState } from "react";
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
  projectName?: string;
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

  // ========================================
  // PROJECT NAME
  // ========================================

  const [projectName, setProjectName] = useState(
    () => projectSettings?.projectName?.trim() || "Untitled Project",
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftProjectName, setDraftProjectName] = useState(projectName);

  const cancelNameEditRef = useRef(false);

  function startEditingName() {
    cancelNameEditRef.current = false;
    setDraftProjectName(projectName);
    setIsEditingName(true);
  }

  function saveProjectName() {
    if (cancelNameEditRef.current) {
      cancelNameEditRef.current = false;
      return;
    }

    setProjectName(draftProjectName.trim() || "Untitled Project");

    setIsEditingName(false);
  }

  function cancelEditingName() {
    cancelNameEditRef.current = true;
    setDraftProjectName(projectName);
    setIsEditingName(false);
  }

  // ========================================
  // TOOLS
  // ========================================

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
  // SWAP TOOL
  // ========================================

  const [swapFromColor, setSwapFromColor] = useState<string | null>(null);

  const [swapToColor, setSwapToColor] = useState<string | null>(null);

  function handleToolChange(tool: Tool) {
    setSelectedTool(tool);
    setSwapFromColor(null);
    setSwapToColor(null);
  }

  function handleSwapFromColor(color: string) {
    setSwapFromColor(color);
    setSwapToColor(null);
  }

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

  function handleResetSwap() {
    setSwapFromColor(null);
    setSwapToColor(null);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}>
          ← Back to home
        </button>

        {/* EDITABLE PROJECT NAME */}
        <div className="project-name-container">
          {isEditingName ? (
            <input
              autoFocus
              className="project-name-input"
              type="text"
              maxLength={100}
              value={draftProjectName}
              onChange={(event) => setDraftProjectName(event.target.value)}
              onFocus={(event) => event.target.select()}
              onBlur={saveProjectName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }

                if (event.key === "Escape") {
                  cancelEditingName();
                }
              }}
              aria-label="Project name"
            />
          ) : (
            <button
              type="button"
              className="project-name-button"
              onClick={startEditingName}
              title="Rename project">
              <span>{projectName}</span>
              <span className="project-name-edit-icon" aria-hidden="true">
                ✎
              </span>
            </button>
          )}
        </div>

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
