import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Toolbar from "../components/canvas/Toolbar";
import ColorPalette from "../components/canvas/ColorPalette";
import PatternCanvas from "../components/canvas/PatternCanvas";
import SwapToolPanel from "../components/canvas/SwapToolPanel";

import { usePatternHistory } from "../hooks/usePatternHistory";
import { useColorPalettes } from "../hooks/useColorPalettes";

import { swapColors } from "../utils/canvas/swapColors";
import { createDmcCodeMap } from "../utils/colors/colorUtils";

import { updateProject } from "../services/projectService";

import type { Pattern, Tool, HalfStitchDirection } from "../types/pattern";

import "../styles/CanvasPage.css";

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

type ProjectSettings = {
  projectName?: string;
  width: number;
  height: number;
  fabricCount: number;
  fabricColor: string;
  selectedPalette: string;
  pattern?: Pattern;
};

function CanvasPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const projectId = Number(params.projectId ?? params.id);

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
  // TOOLS
  // ========================================

  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  const [selectedColor, setSelectedColor] = useState("#000000");

  const [selectedHalfStitchDirection, setSelectedHalfStitchDirection] =
    useState<HalfStitchDirection>("top-left");

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
  // FINISH PAGE
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
      {/* HEADER */}

      <header className="app-header">
        <button
          type="button"
          className="back-button"
          disabled={paletteSaving}
          onClick={() => navigate("/")}>
          <span className="material-symbols-sharp" aria-hidden="true">
            chevron_left
          </span>
          Back to home
        </button>

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

              <span
                className="project-name-edit-icon material-symbols-sharp"
                aria-hidden="true">
                edit_line
              </span>
            </button>
          )}
        </div>

        <div className="save-status" aria-live="polite">
          <span className="save-indicator" />

          <span>
            {paletteSaving
              ? "Saving palette..."
              : paletteSaveError
                ? paletteSaveError
                : "Editing project"}
          </span>
        </div>

        <button
          type="button"
          className="next-button"
          disabled={paletteSaving}
          onClick={handleFinish}>
          Done / Next
          <span className="material-symbols-sharp" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </header>

      {/* EDITOR */}

      <div className="editor-layout">
        {/* LEFT SIDEBAR */}

        <aside className="left-sidebar">
          <Toolbar
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            selectedHalfStitchDirection={selectedHalfStitchDirection}
            onHalfStitchDirectionChange={setSelectedHalfStitchDirection}
          />
        </aside>

        {/* CANVAS */}

        <main className="canvas-area">
          <PatternCanvas
            pattern={pattern}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            selectedHalfStitchDirection={selectedHalfStitchDirection}
            dmcCodeByHex={dmcCodeByHex}
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
              dmcCodeByHex={dmcCodeByHex}
              onReset={handleResetSwap}
              onClose={() => handleToolChange("pencil")}
            />
          )}
        </main>

        {/* RIGHT SIDEBAR */}

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
