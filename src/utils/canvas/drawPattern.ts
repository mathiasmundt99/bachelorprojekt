import type { Pattern } from "../../types/pattern";
import dmcColors from "../../data/dmc-colors.json";

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
  // DRAW DMC NUMBERS ON STITCHES
  // ========================================

  // Vis kun numre, når der er plads til dem
  if (viewport.zoom >= 0.75) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const color = pattern.stitches[y][x];

        if (!color) continue;

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
