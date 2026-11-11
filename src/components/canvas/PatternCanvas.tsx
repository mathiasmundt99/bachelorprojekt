import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { Pattern, Tool } from "../../types/pattern";

import { useCanvasViewport } from "../../hooks/useCanvasViewport";
import { floodFill } from "../../utils/canvas/floodFill";
import { drawPattern, CELL_SIZE } from "../../utils/canvas/drawPattern";

type PatternCanvasProps = {
  pattern: Pattern;
  selectedTool: Tool;
  selectedColor: string;
  onPatternChange: (update: Pattern | ((current: Pattern) => Pattern)) => void;
  onColorChange: (color: string) => void;
  onToolChange: (tool: Tool) => void;
  onSwapColorSelect: (color: string) => void;
  onStrokeStart: () => void;
  onStrokeEnd: () => void;
};

function PatternCanvas({
  pattern,
  selectedTool,
  selectedColor,
  onPatternChange,
  onColorChange,
  onToolChange,
  onSwapColorSelect,
  onStrokeStart,
  onStrokeEnd,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { viewport, canvasSize, startPan, movePan, stopPan } =
    useCanvasViewport(canvasRef, containerRef, pattern.width, pattern.height);

  const isPaintingRef = useRef(false);

  const lastPaintedCellRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  // ========================================
  // DRAW PATTERN
  // ========================================

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    drawPattern({
      canvas,
      pattern,
      viewport,
      width: canvasSize.width,
      height: canvasSize.height,
    });
  }, [pattern, viewport, canvasSize]);

  // ========================================
  // GET CELL FROM POINTER
  // ========================================

  function getCellFromPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    const patternX = (screenX - viewport.offsetX) / viewport.zoom;

    const patternY = (screenY - viewport.offsetY) / viewport.zoom;

    const cellX = Math.floor(patternX / CELL_SIZE);
    const cellY = Math.floor(patternY / CELL_SIZE);

    if (
      cellX < 0 ||
      cellX >= pattern.width ||
      cellY < 0 ||
      cellY >= pattern.height
    ) {
      return null;
    }

    return { x: cellX, y: cellY };
  }

  // ========================================
  // PENCIL AND ERASER
  // ========================================

  function paintCell(x: number, y: number) {
    if (
      lastPaintedCellRef.current?.x === x &&
      lastPaintedCellRef.current?.y === y
    ) {
      return;
    }

    lastPaintedCellRef.current = { x, y };

    onPatternChange((currentPattern) => {
      const oldColor = currentPattern.stitches[y][x];

      const newColor = selectedTool === "eraser" ? null : selectedColor;

      if (oldColor === newColor) {
        return currentPattern;
      }

      const newStitches = currentPattern.stitches.map((row) => [...row]);

      newStitches[y][x] = newColor;

      return {
        ...currentPattern,
        stitches: newStitches,
      };
    });
  }

  // ========================================
  // FILL TOOL
  // ========================================

  function fillArea(startX: number, startY: number) {
    onPatternChange((currentPattern) =>
      floodFill(currentPattern, startX, startY, selectedColor),
    );
  }

  // ========================================
  // EYEDROPPER TOOL
  // ========================================

  function pickColor(x: number, y: number) {
    const color = pattern.stitches[y][x];

    if (color === null) return;

    onColorChange(color);
    onToolChange("pencil");
  }

  // ========================================
  // SWAP TOOL
  // ========================================

  function pickSwapColor(x: number, y: number) {
    const color = pattern.stitches[y][x];

    if (color === null) return;

    onSwapColorSelect(color);
  }

  // ========================================
  // POINTER DOWN
  // ========================================

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 && event.button !== 1) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    if (event.button === 1) {
      startPan(event);
      return;
    }

    const cell = getCellFromPointer(event);

    if (!cell) return;

    if (selectedTool === "swap") {
      pickSwapColor(cell.x, cell.y);
      return;
    }

    if (selectedTool === "eyedropper") {
      pickColor(cell.x, cell.y);
      return;
    }

    if (selectedTool === "fill") {
      fillArea(cell.x, cell.y);
      return;
    }

    if (selectedTool === "pencil" || selectedTool === "eraser") {
      isPaintingRef.current = true;

      onStrokeStart();
      paintCell(cell.x, cell.y);
    }
  }

  // ========================================
  // POINTER MOVE
  // ========================================

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (movePan(event)) return;

    if (!isPaintingRef.current) return;

    const cell = getCellFromPointer(event);

    if (!cell) return;

    paintCell(cell.x, cell.y);
  }

  // ========================================
  // POINTER UP
  // ========================================

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (isPaintingRef.current) {
      onStrokeEnd();
    }

    isPaintingRef.current = false;
    lastPaintedCellRef.current = null;

    stopPan();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div ref={containerRef} className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="pattern-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}

export default PatternCanvas;
