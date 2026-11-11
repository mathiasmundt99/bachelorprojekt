import { useEffect, useMemo, useRef, useState } from "react";

import type { PointerEvent as ReactPointerEvent } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useCanvasViewport } from "../hooks/useCanvasViewport";
import type { Pattern } from "../types/pattern";

import {
  getFinishColors,
  renderFinishPattern,
} from "../utils/canvas/renderFinishPattern";

import type { FinishDisplayMode } from "../utils/canvas/renderFinishPattern";

import "../styles/FinishPage.css";

// ========================================
// TYPES
// ========================================

type FinishProjectState = {
  projectName?: string;
  width: number;
  height: number;
  fabricCount: number;
  fabricColor: string;
  selectedPalette: string;
  pattern: Pattern;
};

// ========================================
// HELPERS
// ========================================

function safeFilename(name: string) {
  return (
    name
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
      .slice(0, 80) || "Untitled-Project"
  );
}

function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ========================================
// COMPONENT
// ========================================

function FinishPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const project = location.state as FinishProjectState | null;

  const pattern = project?.pattern;
  const projectName = project?.projectName || "Untitled Project";

  // ========================================
  // REFS
  // ========================================

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ========================================
  // DISPLAY STATE
  // ========================================

  const [displayMode, setDisplayMode] = useState<FinishDisplayMode>("numbers");

  const [highlightedHex, setHighlightedHex] = useState<string | null>(null);

  const [isPanning, setIsPanning] = useState(false);

  // ========================================
  // SHARED CANVAS VIEWPORT
  // ========================================

  const {
    viewport,
    canvasSize,
    startPan,
    movePan,
    stopPan,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
  } = useCanvasViewport(
    canvasRef,
    containerRef,
    pattern?.width ?? 30,
    pattern?.height ?? 30,
  );

  // ========================================
  // COLOR STATISTICS
  // ========================================

  const colors = useMemo(
    () => (pattern ? getFinishColors(pattern) : []),
    [pattern],
  );

  const totalStitches = useMemo(
    () => colors.reduce((sum, color) => sum + color.count, 0),
    [colors],
  );

  function getTextColor(hex: string): string {
    const normalized = hex.replace("#", "");

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return "#202020";
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 150 ? "#ffffff" : "#202020";
  }

  // ========================================
  // DRAW PATTERN WITH SHARED VIEWPORT
  // ========================================

  useEffect(() => {
    const canvas = canvasRef.current;

    if (
      !canvas ||
      !pattern ||
      canvasSize.width <= 0 ||
      canvasSize.height <= 0
    ) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(canvasSize.width * dpr);
    canvas.height = Math.round(canvasSize.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the complete pattern to an offscreen canvas.
    // This keeps renderFinishPattern.ts unchanged.
    const patternCanvas = document.createElement("canvas");

    renderFinishPattern({
      canvas: patternCanvas,
      pattern,
      colors,
      mode: displayMode,
      highlightedHex,
    });

    // Apply the same viewport coordinates as CanvasPage.
    ctx.setTransform(
      dpr * viewport.zoom,
      0,
      0,
      dpr * viewport.zoom,
      dpr * viewport.offsetX,
      dpr * viewport.offsetY,
    );

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(patternCanvas, 0, 0);
  }, [pattern, colors, displayMode, highlightedHex, viewport, canvasSize]);

  // ========================================
  // AUTOMATIC FIT ON FIRST OPEN
  // ========================================

  const fittedPatternRef = useRef<Pattern | null>(null);

  useEffect(() => {
    if (!pattern || canvasSize.width <= 0 || canvasSize.height <= 0) {
      return;
    }

    if (fittedPatternRef.current === pattern) {
      return;
    }

    fittedPatternRef.current = pattern;
    fitToScreen();
  }, [pattern, canvasSize.width, canvasSize.height, fitToScreen]);

  // ========================================
  // POINTER PAN
  // ========================================

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    // FinishPage is read-only, so both left
    // and middle mouse buttons can pan.
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    event.preventDefault();

    event.currentTarget.setPointerCapture(event.pointerId);

    startPan(event);
    setIsPanning(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    movePan(event);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    stopPan();
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  // ========================================
  // BACK TO EDITOR
  // ========================================

  function backToEditor() {
    navigate("/canvas", {
      state: project,
    });
  }

  // ========================================
  // CREATE EXPORT CANVAS
  // ========================================

  function createExportCanvas() {
    if (!pattern) return null;

    const exportCanvas = document.createElement("canvas");

    renderFinishPattern({
      canvas: exportCanvas,
      pattern,
      colors,
      mode: displayMode,

      // Export the full pattern, regardless
      // of current zoom, pan or highlight.
      highlightedHex: null,
    });

    return exportCanvas;
  }

  // ========================================
  // EXPORT PNG
  // ========================================

  function exportPNG() {
    const exportCanvas = createExportCanvas();
    if (!exportCanvas) return;

    const link = document.createElement("a");

    link.download = `${safeFilename(projectName)}.png`;
    link.href = exportCanvas.toDataURL("image/png");

    link.click();
  }

  // ========================================
  // EXPORT PDF
  // ========================================

  function exportPDF() {
    const exportCanvas = createExportCanvas();

    if (!exportCanvas || !pattern) return;

    const image = exportCanvas.toDataURL("image/png");

    const colorRows = colors
      .map(
        (color) => `
          <tr>
            <td>
              <span
                class="swatch"
                style="background:${escapeHTML(color.hex)}">
              </span>
            </td>
            <td>${escapeHTML(color.code)}</td>
            <td>${escapeHTML(color.name)}</td>
            <td>${escapeHTML(color.symbol)}</td>
            <td>${color.count}</td>
          </tr>
        `,
      )
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert("Allow pop-ups for this site to export the PDF.");
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHTML(projectName)}</title>

          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              color: #202020;
              margin: 0;
            }

            h1 {
              font-size: 25px;
              margin: 0 0 8px;
            }

            h2 {
              font-size: 18px;
              margin-top: 28px;
            }

            p {
              color: #555;
            }

            .pattern {
              display: block;
              max-width: 100%;
              max-height: 220mm;
              width: auto;
              height: auto;
              margin: 18px auto;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th,
            td {
              border: 1px solid #202020;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #d9b9f1;
            }

            .swatch {
              display: inline-block;
              width: 24px;
              height: 24px;
              border: 1px solid #202020;
              vertical-align: middle;
            }

            .key {
              break-before: page;
            }

            tr {
              break-inside: avoid;
            }

            @media print {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>

        <body>
          <h1>${escapeHTML(projectName)}</h1>

          <p>
            ${pattern.width} × ${pattern.height} stitches ·
            ${totalStitches} total stitches ·
            ${colors.length} colors
          </p>

          <img
            class="pattern"
            src="${image}"
            alt="Cross stitch pattern"
          />

          <section class="key">
            <h2>Color key</h2>

            <table>
              <thead>
                <tr>
                  <th>Color</th>
                  <th>DMC</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Stitches</th>
                </tr>
              </thead>

              <tbody>${colorRows}</tbody>
            </table>
          </section>
        </body>
      </html>
    `);

    printWindow.document.close();

    const printImage = printWindow.document.querySelector("img");

    const startPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    if (printImage?.complete) {
      startPrint();
    } else if (printImage) {
      printImage.addEventListener("load", startPrint, { once: true });
    }
  }

  // ========================================
  // NO PATTERN
  // ========================================

  if (!pattern) {
    return (
      <div className="finish-page finish-missing">
        <h1>No pattern to preview</h1>

        <p>Open a project in the editor and click Done / Next.</p>

        <button
          type="button"
          className="finish-primary-button"
          onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="finish-page">
      {/* HEADER */}
      <header className="finish-header">
        <div>
          <span className="finish-eyebrow">PATTERN OVERVIEW</span>

          <h1>{projectName}</h1>
        </div>

        <button
          type="button"
          className="finish-back-button"
          onClick={backToEditor}>
          ← Back to editor
        </button>
      </header>

      <main className="finish-content">
        {/* STATISTICS */}
        <section className="finish-stats">
          <div className="finish-stat finish-stat-purple">
            <span>TOTAL STITCHES</span>

            <strong>{totalStitches.toLocaleString()}</strong>
          </div>

          <div className="finish-stat finish-stat-yellow">
            <span>DMC COLORS</span>
            <strong>{colors.length}</strong>
          </div>

          <div className="finish-stat finish-stat-green">
            <span>PATTERN SIZE</span>

            <strong>
              {pattern.width} × {pattern.height}
            </strong>
          </div>
        </section>

        {/* MAIN LAYOUT */}
        <div className="finish-layout">
          {/* LEFT: PATTERN PREVIEW */}
          <section className="finish-preview-panel">
            {/* COMPACT PATTERN HEADER */}
            <div className="finish-panel-heading">
              <div>
                <span className="finish-section-label">YOUR DESIGN</span>
                <h2>Pattern preview</h2>
              </div>

              <span className="finish-pattern-size">
                {pattern.width} × {pattern.height} stitches
              </span>
            </div>

            {/* COMBINED DISPLAY + ZOOM TOOLBAR */}
            <div className="finish-compact-toolbar">
              <div className="finish-toolbar-group">
                <span className="finish-toolbar-label">DISPLAY</span>

                <div className="finish-display-buttons">
                  <button
                    type="button"
                    className={displayMode === "numbers" ? "active" : ""}
                    onClick={() => setDisplayMode("numbers")}>
                    Numbers
                  </button>

                  <button
                    type="button"
                    className={displayMode === "symbols" ? "active" : ""}
                    onClick={() => setDisplayMode("symbols")}>
                    Symbols
                  </button>

                  <button
                    type="button"
                    className={displayMode === "colors" ? "active" : ""}
                    onClick={() => setDisplayMode("colors")}>
                    Colors
                  </button>
                </div>
              </div>

              <div className="finish-toolbar-group">
                <span className="finish-toolbar-label">ZOOM</span>

                <div className="finish-zoom-controls">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={viewport.zoom <= 0.25}
                    aria-label="Zoom out">
                    −
                  </button>

                  <span className="finish-zoom-value">
                    {Math.round(viewport.zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={viewport.zoom >= 8}
                    aria-label="Zoom in">
                    +
                  </button>

                  <button type="button" onClick={resetZoom}>
                    100%
                  </button>

                  <button type="button" onClick={fitToScreen}>
                    Fit
                  </button>
                </div>
              </div>
            </div>

            {/* HIGHLIGHT NOTICE */}
            {highlightedHex && (
              <div className="finish-highlight-notice">
                <span>
                  Highlighting DMC{" "}
                  {colors.find((color) => color.hex === highlightedHex)?.code}
                </span>

                <button type="button" onClick={() => setHighlightedHex(null)}>
                  Clear highlight ×
                </button>
              </div>
            )}

            {/* SHARED CANVAS VIEWPORT */}
            <div
              ref={containerRef}
              className={`finish-canvas-container ${
                isPanning ? "is-panning" : ""
              }`}>
              <canvas
                ref={canvasRef}
                className="finish-pattern-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onContextMenu={(event) => event.preventDefault()}
                aria-label="Finished cross stitch pattern"
                role="img"
              />
            </div>

            <div className="finish-preview-footer">
              <span>
                {pattern.width} × {pattern.height} stitches
              </span>

              <span>Scroll to pan · Pinch to zoom · Drag to move</span>
            </div>
          </section>

          {/* RIGHT: COLOR KEY */}
          <aside className="finish-key-panel">
            <div className="finish-key-header">
              <span className="finish-section-label">THREAD GUIDE</span>

              <h2>Color key</h2>

              <p>Select a color to highlight its stitches on the pattern.</p>
            </div>

            <div className="finish-key-list">
              {colors.length === 0 ? (
                <p className="finish-no-colors">
                  No stitches in this pattern yet.
                </p>
              ) : (
                colors.map((color) => {
                  const isActive = highlightedHex === color.hex;

                  return (
                    <button
                      key={color.hex}
                      type="button"
                      className={`finish-key-item ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setHighlightedHex(isActive ? null : color.hex)
                      }
                      aria-pressed={isActive}>
                      <span
                        className="finish-key-swatch"
                        style={{
                          backgroundColor: color.hex,
                        }}>
                        {displayMode !== "colors" && (
                          <span
                            className="finish-key-symbol"
                            style={{
                              color: getTextColor(color.hex),
                            }}>
                            {displayMode === "numbers"
                              ? color.code
                              : color.symbol}
                          </span>
                        )}
                      </span>

                      <span className="finish-key-info">
                        <strong>DMC {color.code}</strong>
                        <span>{color.name}</span>
                      </span>

                      <span className="finish-key-count">
                        <strong>{color.count}</strong>
                        <span>stitches</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="finish-key-total">
              <span>TOTAL</span>

              <strong>{totalStitches.toLocaleString()} stitches</strong>
            </div>
          </aside>
        </div>

        {/* EXPORT */}
        <section className="finish-export-panel">
          <div>
            <span className="finish-section-label">READY TO STITCH?</span>

            <h2>Export your pattern</h2>

            <p>
              Download an image or create a printable PDF with your color key.
            </p>
          </div>

          <div className="finish-export-actions">
            <button
              type="button"
              className="finish-png-button"
              onClick={exportPNG}>
              Download PNG
            </button>

            <button
              type="button"
              className="finish-primary-button"
              onClick={exportPDF}>
              Export PDF
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default FinishPage;
