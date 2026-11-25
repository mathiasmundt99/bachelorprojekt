import type { Pattern } from "../../types/pattern";
import dmcColors from "../../data/dmc-colors.json";

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
  backstitchPreview?: BackstitchPreview | null;
};

// Find DMC-koden ud fra farvens hex-værdi
const dmcCodeByHex = new Map(
  dmcColors.map((color) => [color.hex.toLowerCase(), color.code]),
);

function getDmcCode(hex: string): string | null {
  return dmcCodeByHex.get(hex.toLowerCase()) ?? null;
}

// Vælg en læsbar tekstfarve
function getTextColor(hex: string): string {
  const normalized = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#000000";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 150 ? "#ffffff" : "#000000";
}

export function drawPattern({
  canvas,
  pattern,
  viewport,
  width,
  height,
  backstitchPreview,
}: DrawPatternOptions) {
  if (width <= 0 || height <= 0) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

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

  // ========================================
  // DRAW FULL STITCHES
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
  // DRAW HALF STITCHES
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
  // DRAW GRID
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
  // DRAW DMC NUMBERS ON FULL STITCHES
  // ========================================

  if (viewport.zoom >= 0.75) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const color = pattern.stitches[y][x];

        if (!color) continue;

        // Undgå overlappende numre på half stitches
        const hasHalfStitch = (pattern.halfStitches ?? []).some(
          (stitch) => stitch.x === x && stitch.y === y,
        );

        if (hasHalfStitch) continue;

        const code = getDmcCode(color);

        if (!code) continue;

        ctx.fillStyle = getTextColor(color);
        ctx.font = "bold 9px Arial";

        const centerX = x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = y * CELL_SIZE + CELL_SIZE / 2;

        ctx.fillText(code, centerX, centerY, CELL_SIZE - 2);
      }
    }
  }

  // ========================================
  // DRAW DMC NUMBERS ON HALF STITCHES
  // ========================================

  if (viewport.zoom >= 1.25) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 7px Arial";

    for (const stitch of pattern.halfStitches ?? []) {
      const code = getDmcCode(stitch.color);

      if (!code) continue;

      const x = stitch.x * CELL_SIZE;
      const y = stitch.y * CELL_SIZE;

      let textX = x;
      let textY = y;

      switch (stitch.direction) {
        case "top-left":
          textX += CELL_SIZE / 3;
          textY += CELL_SIZE / 3;
          break;

        case "top-right":
          textX += (CELL_SIZE * 2) / 3;
          textY += CELL_SIZE / 3;
          break;

        case "bottom-left":
          textX += CELL_SIZE / 3;
          textY += (CELL_SIZE * 2) / 3;
          break;

        case "bottom-right":
          textX += (CELL_SIZE * 2) / 3;
          textY += (CELL_SIZE * 2) / 3;
          break;
      }

      ctx.fillStyle = getTextColor(stitch.color);

      ctx.fillText(code, textX, textY, CELL_SIZE * 0.45);
    }
  }

  // ========================================
  // DRAW BACKSTITCHES
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
  // DRAW FRENCH KNOTS
  // ========================================

  for (const knot of pattern.frenchKnots ?? []) {
    // Placér knuden på gitterets skæringspunkt
    const x = knot.x * CELL_SIZE;
    const y = knot.y * CELL_SIZE;

    const radius = CELL_SIZE * 0.2;

    ctx.fillStyle = knot.color;

    ctx.beginPath();

    ctx.arc(x, y, radius, 0, Math.PI * 2);

    ctx.fill();
  }

  // ========================================
  // DRAW BACKSTITCH PREVIEW
  // ========================================

  if (backstitchPreview) {
    const { start, end, color } = backstitchPreview;

    const startX = start.x * CELL_SIZE;
    const startY = start.y * CELL_SIZE;

    ctx.save();

    // Preview line
    if (end) {
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = color;
      ctx.lineWidth = CELL_SIZE * 0.12;
      ctx.lineCap = "round";

      ctx.setLineDash([CELL_SIZE * 0.2, CELL_SIZE * 0.12]);

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      ctx.lineTo(end.x * CELL_SIZE, end.y * CELL_SIZE);

      ctx.stroke();
    }

    // Start point
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1 / viewport.zoom;

    ctx.beginPath();

    ctx.arc(startX, startY, CELL_SIZE * 0.15, 0, Math.PI * 2);

    ctx.fill();
    ctx.stroke();

    // End point
    if (end) {
      ctx.beginPath();

      ctx.arc(
        end.x * CELL_SIZE,
        end.y * CELL_SIZE,
        CELL_SIZE * 0.15,
        0,
        Math.PI * 2,
      );

      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
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
