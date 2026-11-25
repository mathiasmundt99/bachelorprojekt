import type { Pattern } from "../../types/pattern";
import type { CanvasSettings } from "../../types/canvasSettings";

import { drawGrid } from "./drawGrid";
import { drawStitchLabels } from "./drawStitchLabels";

export const CELL_SIZE = 24;

export type Viewport = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type Point = {
  x: number;
  y: number;
};

export type BackstitchPreview = {
  start: Point;
  end: Point | null;
  color: string;
};

type DrawPatternOptions = {
  canvas: HTMLCanvasElement;
  pattern: Pattern;
  viewport: Viewport;
  width: number;
  height: number;
  settings: CanvasSettings;
  dmcCodeByHex: ReadonlyMap<string, string>;
  stitchSymbols: ReadonlyMap<string, string>;
  backstitchPreview?: BackstitchPreview | null;
};

export function drawPattern({
  canvas,
  pattern,
  viewport,
  width,
  height,
  settings,
  dmcCodeByHex,
  stitchSymbols,
  backstitchPreview,
}: DrawPatternOptions) {
  const ctx = canvas.getContext("2d");

  if (!ctx || width <= 0 || height <= 0) return;

  const dpr = window.devicePixelRatio || 1;

  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (canvas.width !== pixelWidth) {
    canvas.width = pixelWidth;
  }

  if (canvas.height !== pixelHeight) {
    canvas.height = pixelHeight;
  }

  // ========================================
  // CLEAR CANVAS
  // ========================================

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(
    dpr * viewport.zoom,
    0,
    0,
    dpr * viewport.zoom,
    dpr * viewport.offsetX,
    dpr * viewport.offsetY,
  );

  const patternWidth = pattern.width * CELL_SIZE;
  const patternHeight = pattern.height * CELL_SIZE;

  // ========================================
  // PATTERN BACKGROUND
  // ========================================

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(0, 0, patternWidth, patternHeight);

  // ========================================
  // FULL STITCHES
  // ========================================

  for (let y = 0; y < pattern.height; y++) {
    for (let x = 0; x < pattern.width; x++) {
      const color = pattern.stitches[y][x];

      if (!color) continue;

      ctx.fillStyle = color;

      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // ========================================
  // HALF STITCHES
  // ========================================

  for (const stitch of pattern.halfStitches ?? []) {
    const x = stitch.x * CELL_SIZE;
    const y = stitch.y * CELL_SIZE;

    ctx.fillStyle = stitch.color;
    ctx.beginPath();

    switch (stitch.direction) {
      case "top-left":
        ctx.moveTo(x, y);
        ctx.lineTo(x + CELL_SIZE, y);
        ctx.lineTo(x, y + CELL_SIZE);
        break;

      case "top-right":
        ctx.moveTo(x, y);
        ctx.lineTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        break;

      case "bottom-left":
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + CELL_SIZE);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        break;

      case "bottom-right":
        ctx.moveTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.lineTo(x, y + CELL_SIZE);
        break;
    }

    ctx.closePath();
    ctx.fill();
  }

  // ========================================
  // GRID
  // ========================================

  drawGrid({
    ctx,
    pattern,
    settings,
    cellSize: CELL_SIZE,
    zoom: viewport.zoom,
  });

  // ========================================
  // STITCH LABELS
  // ========================================

  drawStitchLabels({
    ctx,
    pattern,
    settings,
    cellSize: CELL_SIZE,
    zoom: viewport.zoom,
    dmcCodeByHex,
    stitchSymbols,
  });

  // ========================================
  // BACKSTITCHES
  // ========================================

  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = CELL_SIZE * 0.12;

  for (const stitch of pattern.backstitches ?? []) {
    ctx.strokeStyle = stitch.color;

    ctx.beginPath();

    ctx.moveTo(stitch.startX * CELL_SIZE, stitch.startY * CELL_SIZE);

    ctx.lineTo(stitch.endX * CELL_SIZE, stitch.endY * CELL_SIZE);

    ctx.stroke();
  }

  ctx.restore();

  // ========================================
  // FRENCH KNOTS
  // ========================================

  for (const knot of pattern.frenchKnots ?? []) {
    ctx.fillStyle = knot.color;

    ctx.beginPath();

    ctx.arc(
      knot.x * CELL_SIZE,
      knot.y * CELL_SIZE,
      CELL_SIZE * 0.2,
      0,
      Math.PI * 2,
    );

    ctx.fill();
  }

  // ========================================
  // BACKSTITCH PREVIEW
  // ========================================

  if (backstitchPreview) {
    ctx.save();

    const { start, end, color } = backstitchPreview;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = CELL_SIZE * 0.12;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.65;

    if (end) {
      ctx.setLineDash([CELL_SIZE * 0.2, CELL_SIZE * 0.15]);

      ctx.beginPath();

      ctx.moveTo(start.x * CELL_SIZE, start.y * CELL_SIZE);

      ctx.lineTo(end.x * CELL_SIZE, end.y * CELL_SIZE);

      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const points = end ? [start, end] : [start];

    for (const point of points) {
      ctx.beginPath();

      ctx.arc(
        point.x * CELL_SIZE,
        point.y * CELL_SIZE,
        CELL_SIZE * 0.15,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1 / viewport.zoom;

      ctx.stroke();
    }

    ctx.restore();
  }

  // ========================================
  // COLUMN AND ROW NUMBERS
  // ========================================

  ctx.save();

  ctx.fillStyle = "#202020";
  ctx.font = `${12 / viewport.zoom}px Arial`;

  const labelInterval = Math.max(
    1,
    Math.ceil(20 / (CELL_SIZE * viewport.zoom)),
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  for (let x = 0; x < pattern.width; x++) {
    if (x % labelInterval !== 0) continue;

    ctx.fillText(
      String(x + 1),
      x * CELL_SIZE + CELL_SIZE / 2,
      -7 / viewport.zoom,
    );
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let y = 0; y < pattern.height; y++) {
    if (y % labelInterval !== 0) continue;

    ctx.fillText(
      String(y + 1),
      -8 / viewport.zoom,
      y * CELL_SIZE + CELL_SIZE / 2,
    );
  }

  ctx.restore();
}
