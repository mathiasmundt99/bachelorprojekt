import type { Pattern } from "../../types/pattern";

export const CELL_SIZE = 24;

export type Viewport = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type DrawPatternOptions = {
  canvas: HTMLCanvasElement;
  pattern: Pattern;
  viewport: Viewport;
  width: number;
  height: number;
};

export function drawPattern({
  canvas,
  pattern,
  viewport,
  width,
  height,
}: DrawPatternOptions) {
  if (width <= 0 || height <= 0) return;

  const dpr = window.devicePixelRatio || 1;

  // Sørg for, at canvas er skarpt på Retina-skærme
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // Ryd canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Anvend zoom og panorering
  ctx.setTransform(
    dpr * viewport.zoom,
    0,
    0,
    dpr * viewport.zoom,
    dpr * viewport.offsetX,
    dpr * viewport.offsetY,
  );

  // ========================================
  // DRAW STITCHES
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
  // DRAW VERTICAL GRID LINES
  // ========================================

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

  // ========================================
  // DRAW HORIZONTAL GRID LINES
  // ========================================

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

  // ========================================
  // DRAW COLUMN NUMBERS
  // ========================================

  ctx.fillStyle = "#222222";
  ctx.font = `${12 / viewport.zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  for (let x = 0; x < pattern.width; x++) {
    const centerX = x * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillText(String(x + 1), centerX, -7);
  }

  // ========================================
  // DRAW ROW NUMBERS
  // ========================================

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let y = 0; y < pattern.height; y++) {
    const centerY = y * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillText(String(y + 1), -8, centerY);
  }
}
