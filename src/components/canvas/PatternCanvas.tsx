import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type {
  Pattern,
  Tool,
  HalfStitchDirection,
  Backstitch,
} from "../../types/pattern";

import { useCanvasViewport } from "../../hooks/useCanvasViewport";
import { floodFill } from "../../utils/canvas/floodFill";
import {
  drawPattern,
  CELL_SIZE,
  type BackstitchPreview,
} from "../../utils/canvas/drawPattern";

type Point = {
  x: number;
  y: number;
};

type PatternCanvasProps = {
  pattern: Pattern;
  selectedTool: Tool;
  selectedColor: string;
  selectedHalfStitchDirection: HalfStitchDirection;
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
  selectedHalfStitchDirection,
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
  const lastPaintedCellRef = useRef<Point | null>(null);
  const backstitchStartRef = useRef<Point | null>(null);
  const [backstitchPreview, setBackstitchPreview] =
    useState<BackstitchPreview | null>(null);

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
  // RESET BACKSTITCH
  // ========================================

  useEffect(() => {
    backstitchStartRef.current = null;
  }, [selectedTool]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        backstitchStartRef.current = null;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ========================================
  // GET POINTER POSITION
  // ========================================

  function getPatternPosition(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point | null {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    return {
      x: (screenX - viewport.offsetX) / viewport.zoom,
      y: (screenY - viewport.offsetY) / viewport.zoom,
    };
  }

  // ========================================
  // GET CELL FROM POINTER
  // ========================================

  function getCellFromPointer(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point | null {
    const position = getPatternPosition(event);

    if (!position) return null;

    const cellX = Math.floor(position.x / CELL_SIZE);
    const cellY = Math.floor(position.y / CELL_SIZE);

    if (
      cellX < 0 ||
      cellX >= pattern.width ||
      cellY < 0 ||
      cellY >= pattern.height
    ) {
      return null;
    }

    return {
      x: cellX,
      y: cellY,
    };
  }

  // ========================================
  // GET GRID INTERSECTION FROM POINTER
  // ========================================

  function getGridPointFromPointer(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point | null {
    const position = getPatternPosition(event);

    if (!position) return null;

    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x > pattern.width * CELL_SIZE ||
      position.y > pattern.height * CELL_SIZE
    ) {
      return null;
    }

    return {
      x: Math.round(position.x / CELL_SIZE),
      y: Math.round(position.y / CELL_SIZE),
    };
  }

  // ========================================
  // FIND FRENCH KNOT
  // ========================================

  function findFrenchKnot(currentPattern: Pattern, position: Point) {
    const hitRadius = CELL_SIZE * 0.3;

    return [...(currentPattern.frenchKnots ?? [])].reverse().find((knot) => {
      const knotX = knot.x * CELL_SIZE;
      const knotY = knot.y * CELL_SIZE;

      return Math.hypot(position.x - knotX, position.y - knotY) <= hitRadius;
    });
  }

  // ========================================
  // FIND BACKSTITCH
  // ========================================

  function distanceToBackstitch(position: Point, stitch: Backstitch): number {
    const startX = stitch.startX * CELL_SIZE;
    const startY = stitch.startY * CELL_SIZE;
    const endX = stitch.endX * CELL_SIZE;
    const endY = stitch.endY * CELL_SIZE;

    const dx = endX - startX;
    const dy = endY - startY;

    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.hypot(position.x - startX, position.y - startY);
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((position.x - startX) * dx + (position.y - startY) * dy) /
          lengthSquared,
      ),
    );

    const closestX = startX + t * dx;
    const closestY = startY + t * dy;

    return Math.hypot(position.x - closestX, position.y - closestY);
  }

  function findBackstitch(currentPattern: Pattern, position: Point) {
    return [...(currentPattern.backstitches ?? [])]
      .reverse()
      .find(
        (stitch) => distanceToBackstitch(position, stitch) <= CELL_SIZE * 0.2,
      );
  }

  // ========================================
  // FIND HALF STITCH
  // ========================================

  function findHalfStitch(
    currentPattern: Pattern,
    position: Point,
    cell: Point,
  ) {
    const localX = position.x / CELL_SIZE - cell.x;
    const localY = position.y / CELL_SIZE - cell.y;

    return [...(currentPattern.halfStitches ?? [])].reverse().find((stitch) => {
      if (stitch.x !== cell.x || stitch.y !== cell.y) {
        return false;
      }

      switch (stitch.direction) {
        case "top-left":
          return localX + localY <= 1;

        case "top-right":
          return localY <= localX;

        case "bottom-left":
          return localY >= localX;

        case "bottom-right":
          return localX + localY >= 1;
      }
    });
  }

  // ========================================
  // PENCIL AND HALF STITCH
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
      // HALF STITCH
      if (selectedTool === "half-stitch") {
        const halfStitches = currentPattern.halfStitches ?? [];

        const existing = halfStitches.find(
          (stitch) =>
            stitch.x === x &&
            stitch.y === y &&
            stitch.direction === selectedHalfStitchDirection,
        );

        if (existing?.color === selectedColor) {
          return currentPattern;
        }

        return {
          ...currentPattern,
          halfStitches: [
            ...halfStitches.filter(
              (stitch) =>
                !(
                  stitch.x === x &&
                  stitch.y === y &&
                  stitch.direction === selectedHalfStitchDirection
                ),
            ),
            {
              x,
              y,
              color: selectedColor,
              direction: selectedHalfStitchDirection,
            },
          ],
        };
      }

      // PENCIL
      if (selectedTool !== "pencil") {
        return currentPattern;
      }

      const oldColor = currentPattern.stitches[y][x];

      if (oldColor === selectedColor) {
        return currentPattern;
      }

      const newStitches = currentPattern.stitches.map((row) => [...row]);

      newStitches[y][x] = selectedColor;

      return {
        ...currentPattern,
        stitches: newStitches,
      };
    });
  }

  // ========================================
  // FRENCH KNOT
  // ========================================

  function placeFrenchKnot(x: number, y: number) {
    if (
      lastPaintedCellRef.current?.x === x &&
      lastPaintedCellRef.current?.y === y
    ) {
      return;
    }

    lastPaintedCellRef.current = { x, y };

    onPatternChange((currentPattern) => {
      const frenchKnots = currentPattern.frenchKnots ?? [];

      const existing = frenchKnots.find((knot) => knot.x === x && knot.y === y);

      if (existing?.color === selectedColor) {
        return currentPattern;
      }

      return {
        ...currentPattern,
        frenchKnots: [
          ...frenchKnots.filter((knot) => !(knot.x === x && knot.y === y)),
          {
            x,
            y,
            color: selectedColor,
          },
        ],
      };
    });
  }

  // ========================================
  // BACKSTITCH
  // ========================================

  function placeBackstitch(x: number, y: number) {
    const start = backstitchStartRef.current;

    if (!start) {
      backstitchStartRef.current = { x, y };
      return;
    }

    if (start.x === x && start.y === y) {
      return;
    }

    onPatternChange((currentPattern) => {
      const backstitches = currentPattern.backstitches ?? [];

      const existingStitches = backstitches.filter((stitch) => {
        const sameDirection =
          stitch.startX === start.x &&
          stitch.startY === start.y &&
          stitch.endX === x &&
          stitch.endY === y;

        const oppositeDirection =
          stitch.startX === x &&
          stitch.startY === y &&
          stitch.endX === start.x &&
          stitch.endY === start.y;

        return !sameDirection && !oppositeDirection;
      });

      return {
        ...currentPattern,
        backstitches: [
          ...existingStitches,
          {
            startX: start.x,
            startY: start.y,
            endX: x,
            endY: y,
            color: selectedColor,
          },
        ],
      };
    });

    backstitchStartRef.current = null;
  }

  // ========================================
  // ERASER
  // ========================================

  function eraseAtPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
    const position = getPatternPosition(event);
    const cell = getCellFromPointer(event);

    if (!position) return;

    onPatternChange((currentPattern) => {
      // ERASE FRENCH KNOT
      const knot = findFrenchKnot(currentPattern, position);

      if (knot) {
        return {
          ...currentPattern,
          frenchKnots: (currentPattern.frenchKnots ?? []).filter(
            (item) => item !== knot,
          ),
        };
      }

      // ERASE BACKSTITCH
      const backstitch = findBackstitch(currentPattern, position);

      if (backstitch) {
        return {
          ...currentPattern,
          backstitches: (currentPattern.backstitches ?? []).filter(
            (item) => item !== backstitch,
          ),
        };
      }

      if (!cell) return currentPattern;

      // ERASE HALF STITCH
      const halfStitch = findHalfStitch(currentPattern, position, cell);

      if (halfStitch) {
        return {
          ...currentPattern,
          halfStitches: (currentPattern.halfStitches ?? []).filter(
            (item) => item !== halfStitch,
          ),
        };
      }

      // ERASE FULL STITCH
      if (currentPattern.stitches[cell.y][cell.x] === null) {
        return currentPattern;
      }

      const newStitches = currentPattern.stitches.map((row) => [...row]);

      newStitches[cell.y][cell.x] = null;

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
  // GET COLOR FROM POINTER
  // ========================================

  function getColorFromPointer(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): string | null {
    const position = getPatternPosition(event);

    if (!position) return null;

    const knot = findFrenchKnot(pattern, position);

    if (knot) return knot.color;

    const backstitch = findBackstitch(pattern, position);

    if (backstitch) return backstitch.color;

    const cell = getCellFromPointer(event);

    if (!cell) return null;

    const halfStitch = findHalfStitch(pattern, position, cell);

    if (halfStitch) return halfStitch.color;

    return pattern.stitches[cell.y][cell.x];
  }

  // ========================================
  // EYEDROPPER TOOL
  // ========================================

  function pickColor(event: ReactPointerEvent<HTMLCanvasElement>) {
    const color = getColorFromPointer(event);

    if (color === null) return;

    onColorChange(color);
    onToolChange("pencil");
  }

  // ========================================
  // SWAP TOOL
  // ========================================

  function pickSwapColor(event: ReactPointerEvent<HTMLCanvasElement>) {
    const color = getColorFromPointer(event);

    if (color === null) return;

    onSwapColorSelect(color);
  }

  // ========================================
  // POINTER DOWN
  // ========================================

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 && event.button !== 1) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    // PAN
    if (event.button === 1) {
      startPan(event);
      return;
    }

    // BACKSTITCH
    if (selectedTool === "backstitch") {
      const point = getGridPointFromPointer(event);

      if (point) {
        placeBackstitch(point.x, point.y);
      }

      return;
    }

    // FRENCH KNOT
    if (selectedTool === "french-knot") {
      const point = getGridPointFromPointer(event);

      if (!point) return;

      isPaintingRef.current = true;

      onStrokeStart();
      placeFrenchKnot(point.x, point.y);

      return;
    }

    // ERASER
    if (selectedTool === "eraser") {
      isPaintingRef.current = true;

      onStrokeStart();
      eraseAtPointer(event);

      return;
    }

    // SWAP
    if (selectedTool === "swap") {
      pickSwapColor(event);
      return;
    }

    // EYEDROPPER
    if (selectedTool === "eyedropper") {
      pickColor(event);
      return;
    }

    const cell = getCellFromPointer(event);

    if (!cell) return;

    // FILL
    if (selectedTool === "fill") {
      fillArea(cell.x, cell.y);
      return;
    }

    // PENCIL AND HALF STITCH
    if (selectedTool === "pencil" || selectedTool === "half-stitch") {
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

    // FRENCH KNOT
    if (selectedTool === "french-knot") {
      const point = getGridPointFromPointer(event);

      if (point) {
        placeFrenchKnot(point.x, point.y);
      }

      return;
    }

    // ERASER
    if (selectedTool === "eraser") {
      eraseAtPointer(event);
      return;
    }

    // PENCIL AND HALF STITCH
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
