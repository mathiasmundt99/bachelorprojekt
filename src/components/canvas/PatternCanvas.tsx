import { useEffect, useRef, useState } from "react";
import type { Pattern, Tool } from "../../types/pattern";

type PatternCanvasProps = {
  pattern: Pattern;
  selectedTool: Tool;
  selectedColor: string;
  onPatternChange: (pattern: Pattern) => void;
};

type Viewport = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

const CELL_SIZE = 24;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function PatternCanvas({
  pattern,
  selectedTool,
  selectedColor,
  onPatternChange,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState<Viewport>({
    zoom: 1,
    offsetX: 50,
    offsetY: 35,
  });

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const isPaintingRef = useRef(false);
  const isPanningRef = useRef(false);

  const lastPaintedCellRef = useRef<{ x: number; y: number } | null>(null);

  const panStartRef = useRef({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  /*
   * Keep the canvas size synchronized with its container.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;

      setCanvasSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Draw the pattern whenever the pattern or viewport changes.
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear the canvas.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*
     * Apply our viewport transformation.
     *
     * Everything after this point is drawn in "pattern space".
     */
    ctx.setTransform(
      dpr * viewport.zoom,
      0,
      0,
      dpr * viewport.zoom,
      dpr * viewport.offsetX,
      dpr * viewport.offsetY,
    );

    /*
     * Draw stitches.
     */
    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const color = pattern.stitches[y][x];

        if (!color) continue;

        const left = x * CELL_SIZE;
        const top = y * CELL_SIZE;

        ctx.fillStyle = color;

        ctx.fillRect(left, top, CELL_SIZE, CELL_SIZE);
      }
    }

    /*
     * Draw grid.
     */
    for (let x = 0; x <= pattern.width; x++) {
      const position = x * CELL_SIZE;
      const isMajorLine = x % 10 === 0;

      ctx.beginPath();

      ctx.strokeStyle = isMajorLine ? "#222222" : "#b8b8b8";
      ctx.lineWidth = (isMajorLine ? 2 : 1) / viewport.zoom;

      ctx.moveTo(position, 0);
      ctx.lineTo(position, pattern.height * CELL_SIZE);

      ctx.stroke();
    }

    for (let y = 0; y <= pattern.height; y++) {
      const position = y * CELL_SIZE;
      const isMajorLine = y % 10 === 0;

      ctx.beginPath();

      ctx.strokeStyle = isMajorLine ? "#222222" : "#b8b8b8";
      ctx.lineWidth = (isMajorLine ? 2 : 1) / viewport.zoom;

      ctx.moveTo(0, position);
      ctx.lineTo(pattern.width * CELL_SIZE, position);

      ctx.stroke();
    }
    /*
     * Draw column numbers.
     */
    ctx.fillStyle = "#222222";
    ctx.font = `${12 / viewport.zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (let x = 0; x < pattern.width; x++) {
      const centerX = x * CELL_SIZE + CELL_SIZE / 2;

      ctx.fillText(String(x + 1), centerX, -7);
    }

    /*
     * Draw row numbers.
     */
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let y = 0; y < pattern.height; y++) {
      const centerY = y * CELL_SIZE + CELL_SIZE / 2;

      ctx.fillText(String(y + 1), -8, centerY);
    }
  }, [pattern, viewport, canvasSize]);

  /*
   * Convert a mouse/pointer position into a pattern cell.
   */
  function getCellFromPointer(event: React.PointerEvent<HTMLCanvasElement>) {
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

    return {
      x: cellX,
      y: cellY,
    };
  }

  /*
   * Paint one cell.
   */
  function paintCell(x: number, y: number) {
    if (
      lastPaintedCellRef.current?.x === x &&
      lastPaintedCellRef.current?.y === y
    ) {
      return;
    }

    const newStitches = pattern.stitches.map((row) => [...row]);

    if (selectedTool === "pencil") {
      newStitches[y][x] = selectedColor;
    }

    if (selectedTool === "eraser") {
      newStitches[y][x] = null;
    }

    if (selectedTool === "fill") {
      // We'll implement fill later.
      return;
    }

    lastPaintedCellRef.current = { x, y };

    onPatternChange({
      ...pattern,
      stitches: newStitches,
    });
  }

  /*
   * Start either drawing or panning.
   *
   * Left button = drawing
   * Middle button = panning
   */
  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);

    if (event.button === 1) {
      isPanningRef.current = true;

      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
      };

      return;
    }

    if (event.button !== 0) return;

    isPaintingRef.current = true;

    const cell = getCellFromPointer(event);

    if (!cell) return;

    paintCell(cell.x, cell.y);
  }

  /*
   * Continue drawing or panning.
   */
  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (isPanningRef.current) {
      const deltaX = event.clientX - panStartRef.current.x;
      const deltaY = event.clientY - panStartRef.current.y;

      setViewport((current) => ({
        ...current,
        offsetX: panStartRef.current.offsetX + deltaX,
        offsetY: panStartRef.current.offsetY + deltaY,
      }));

      return;
    }

    if (!isPaintingRef.current) return;

    const cell = getCellFromPointer(event);

    if (!cell) return;

    paintCell(cell.x, cell.y);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    isPaintingRef.current = false;
    isPanningRef.current = false;
    lastPaintedCellRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /*
   * Trackpad:
   *
   * Two-finger movement normally produces a regular wheel event.
   * Pinch-to-zoom on macOS browsers normally produces a wheel event
   * with ctrlKey = true.
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      /*
       * Two-finger trackpad movement = PAN
       */
      if (!event.ctrlKey) {
        setViewport((current) => ({
          ...current,
          offsetX: current.offsetX - event.deltaX,
          offsetY: current.offsetY - event.deltaY,
        }));

        return;
      }

      /*
       * Trackpad pinch = ZOOM
       */

      const rect = canvas!.getBoundingClientRect();

      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      // Find the pattern point currently underneath the cursor.
      const patternX = (cursorX - viewport.offsetX) / viewport.zoom;

      const patternY = (cursorY - viewport.offsetY) / viewport.zoom;

      /*
       * Exponential scaling gives us smooth zooming.
       */
      const zoomFactor = Math.exp(-event.deltaY * 0.01);

      const newZoom = clamp(viewport.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);

      /*
       * Adjust the offset so the point under the cursor
       * stays underneath the cursor.
       */
      const newOffsetX = cursorX - patternX * newZoom;

      const newOffsetY = cursorY - patternY * newZoom;

      setViewport({
        zoom: newZoom,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    }

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [viewport]);

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
