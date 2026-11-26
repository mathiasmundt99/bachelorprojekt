import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Toolbar from "../components/canvas/Toolbar";
import ColorPalette from "../components/canvas/ColorPalette";
import PatternCanvas from "../components/canvas/PatternCanvas";
import SwapToolPanel from "../components/canvas/SwapToolPanel";
import CanvasSettingsPanel from "../components/canvas/CanvasSettingsPanel";

import { usePatternHistory } from "../hooks/usePatternHistory";
import { useColorPalettes } from "../hooks/useColorPalettes";
import { useCanvasSettings } from "../hooks/useCanvasSettings";

import { swapColors } from "../utils/canvas/swapColors";
import { createDmcCodeMap } from "../utils/colors/colorUtils";
import { createStitchSymbolMap } from "../utils/canvas/stitchSymbols";

import { updateProject } from "../services/projectService";

import type { Pattern, Tool, HalfStitchDirection } from "../types/pattern";

import type { ResizeDimensions } from "../types/canvasResize";

import "../styles/CanvasPage.css";

// ========================================
// PROJECT SETTINGS
// ========================================

type ProjectSettings = {
  projectName?: string;
  width: number;
  height: number;
  fabricCount: number;
  fabricColor: string;
  selectedPalette: string;
  pattern?: Pattern;
};

// ========================================
// CREATE EMPTY PATTERN
// ========================================

function createEmptyPattern(width: number, height: number): Pattern {
  return {
    width,
    height,

    stitches: Array.from({ length: height }, () => Array(width).fill(null)),

    halfStitches: [],
    backstitches: [],
    frenchKnots: [],
  };
}

// ========================================
// CANVAS PAGE
// ========================================

function CanvasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const projectId = Number(params.projectId ?? params.id);

  const projectSettings = location.state as ProjectSettings | null;

  const width = projectSettings?.width ?? 30;
  const height = projectSettings?.height ?? 30;

  // ========================================
  // PROJECT NAME
  // ========================================

  const [projectName, setProjectName] = useState(
    projectSettings?.projectName ?? "Untitled project",
  );

  const [isEditingName, setIsEditingName] = useState(false);

  const [draftName, setDraftName] = useState(projectName);

  const cancelNameEditRef = useRef(false);

  function startEditingName() {
    cancelNameEditRef.current = false;
    setDraftName(projectName);
    setIsEditingName(true);
  }

  function saveProjectName() {
    if (cancelNameEditRef.current) {
      cancelNameEditRef.current = false;
      return;
    }

    const nextName = draftName.trim();

    if (nextName) {
      setProjectName(nextName);
    }

    setIsEditingName(false);
  }

  function cancelEditingName() {
    cancelNameEditRef.current = true;
    setDraftName(projectName);
    setIsEditingName(false);
  }

  // ========================================
  // COLOR PALETTES
  // ========================================

  const { allColors, palettes, loading, error, loadPalettes } =
    useColorPalettes();

  const [selectedPaletteId, setSelectedPaletteId] = useState(
    () => projectSettings?.selectedPalette ?? "all",
  );

  const [paletteSaving, setPaletteSaving] = useState(false);

  const [paletteSaveError, setPaletteSaveError] = useState("");

  const dmcCodeByHex = useMemo(() => createDmcCodeMap(allColors), [allColors]);

  const stitchSymbols = useMemo(
    () => createStitchSymbolMap(dmcCodeByHex),
    [dmcCodeByHex],
  );

  async function handlePaletteChange(paletteId: string) {
    if (paletteSaving || paletteId === selectedPaletteId) {
      return;
    }

    const previousPalette = selectedPaletteId;

    setSelectedPaletteId(paletteId);
    setPaletteSaveError("");

    if (!Number.isInteger(projectId) || projectId <= 0) {
      setSelectedPaletteId(previousPalette);
      setPaletteSaveError("Project ID is missing.");

      return;
    }

    try {
      setPaletteSaving(true);

      await updateProject(projectId, {
        palette_id: paletteId === "all" ? null : Number(paletteId),
      });
    } catch (err) {
      console.error("Error saving palette:", err);

      setSelectedPaletteId(previousPalette);

      setPaletteSaveError("Could not save the selected palette.");
    } finally {
      setPaletteSaving(false);
    }
  }

  // ========================================
  // SELECTED TOOL
  // ========================================

  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  const [selectedColor, setSelectedColor] = useState("#000000");

  const [selectedHalfStitchDirection, setSelectedHalfStitchDirection] =
    useState<HalfStitchDirection>("top-left");

  // ========================================
  // CANVAS SETTINGS
  // ========================================

  const {
    settings,
    settingsOpen,
    isResizing,
    updateSettings,
    toggleSettings,
    closeSettings,
    toggleResize,
  } = useCanvasSettings();

  // ========================================
  // CANVAS RESIZE
  // ========================================

  const [resizeDimensions, setResizeDimensions] =
    useState<ResizeDimensions | null>(null);

  function handleToggleResize() {
    setResizeDimensions(null);
    toggleResize();
  }

  function handleCloseSettings() {
    setResizeDimensions(null);
    closeSettings();
  }

  function handleToggleSettings() {
    setResizeDimensions(null);
    toggleSettings();
  }

  // ========================================
  // PATTERN HISTORY
  // ========================================

  const initialPatternRef = useRef<Pattern>(
    projectSettings?.pattern ?? createEmptyPattern(width, height),
  );

  const {
    pattern,
    setPattern,
    beginStroke,
    endStroke,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePatternHistory(initialPatternRef.current);

  // ========================================
  // SWAP TOOL
  // ========================================

  const [swapFromColor, setSwapFromColor] = useState<string | null>(null);

  const [swapToColor, setSwapToColor] = useState<string | null>(null);

  function handleResetSwap() {
    setSwapFromColor(null);
    setSwapToColor(null);
  }

  function handleToolChange(tool: Tool) {
    if (isResizing) return;

    setSelectedTool(tool);
    handleResetSwap();
  }

  function handleSwapFromColor(color: string) {
    if (isResizing) return;

    setSwapFromColor(color);
    setSwapToColor(null);
  }

  function handlePaletteColorChange(color: string) {
    if (isResizing) return;

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
  // NAVIGATION
  // ========================================

  function handleFinish() {
    navigate("/finish", {
      state: {
        ...projectSettings,
        projectId,
        projectName,
        width: pattern.width,
        height: pattern.height,
        selectedPalette: selectedPaletteId,
        pattern,
      },
    });
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app">
      {/* ====================================
          HEADER
      ==================================== */}

      <header className="app-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/home")}
          disabled={paletteSaving}>
          <span className="material-symbols-sharp">arrow_back</span>
          Back to home
        </button>

        <div className="project-name">
          {isEditingName ? (
            <input
              className="project-name-input"
              type="text"
              value={draftName}
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={saveProjectName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }

                if (event.key === "Escape") {
                  cancelEditingName();
                }
              }}
            />
          ) : (
            <button
              type="button"
              className="project-name-button"
              onClick={startEditingName}
              title="Edit project name">
              <span>{projectName}</span>

              <span className="material-symbols-sharp">edit</span>
            </button>
          )}
        </div>

        <div className="save-status" aria-live="polite">
          <span className="save-indicator" />

          {paletteSaving
            ? "Saving palette..."
            : paletteSaveError
              ? paletteSaveError
              : "Editing project"}
        </div>

        <button
          type="button"
          className="next-button"
          onClick={handleFinish}
          disabled={paletteSaving}>
          Done / Next
          <span className="material-symbols-sharp">arrow_forward</span>
        </button>
      </header>

      {/* ====================================
          EDITOR LAYOUT
      ==================================== */}

      <div className="editor-layout">
        {/* ==================================
            LEFT SIDEBAR
        ================================== */}

        <aside className="left-sidebar">
          <Toolbar
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo && !resizeDimensions}
            canRedo={canRedo && !resizeDimensions}
            selectedHalfStitchDirection={selectedHalfStitchDirection}
            onHalfStitchDirectionChange={setSelectedHalfStitchDirection}
            settingsOpen={settingsOpen}
            onSettingsClick={handleToggleSettings}
          />

          {settingsOpen && (
            <CanvasSettingsPanel
              settings={settings}
              width={resizeDimensions?.width ?? pattern.width}
              height={resizeDimensions?.height ?? pattern.height}
              isResizing={isResizing}
              onSettingsChange={updateSettings}
              onToggleResize={handleToggleResize}
              onClose={handleCloseSettings}
            />
          )}
        </aside>

        {/* ==================================
            CANVAS AREA
        ================================== */}

        <main className="canvas-area">
          <PatternCanvas
            pattern={pattern}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            selectedHalfStitchDirection={selectedHalfStitchDirection}
            dmcCodeByHex={dmcCodeByHex}
            stitchSymbols={stitchSymbols}
            settings={settings}
            isResizing={isResizing}
            onResizeDimensionsChange={setResizeDimensions}
            onPatternChange={setPattern}
            onColorChange={setSelectedColor}
            onToolChange={handleToolChange}
            onSwapColorSelect={handleSwapFromColor}
            onStrokeStart={beginStroke}
            onStrokeEnd={endStroke}
          />

          {selectedTool === "swap" && !isResizing && (
            <SwapToolPanel
              fromColor={swapFromColor}
              toColor={swapToColor}
              dmcCodeByHex={dmcCodeByHex}
              onReset={handleResetSwap}
              onClose={() => handleToolChange("pencil")}
            />
          )}
        </main>

        {/* ==================================
            RIGHT SIDEBAR
        ================================== */}

        <aside className="right-sidebar">
          <ColorPalette
            selectedColor={selectedColor}
            onColorChange={handlePaletteColorChange}
            pattern={pattern}
            selectedPaletteId={selectedPaletteId}
            onPaletteChange={handlePaletteChange}
            allColors={allColors}
            palettes={palettes}
            loading={loading}
            error={error}
            onPalettesUpdated={loadPalettes}
            paletteSaving={paletteSaving}
          />
        </aside>
      </div>
    </div>
  );
}

export default CanvasPage;
