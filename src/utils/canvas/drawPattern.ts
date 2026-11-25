import type { Pattern } from "../../types/pattern";

import { getDmcCode, getTextColor } from "../colors/colorUtils";

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
  dmcCodeByHex: ReadonlyMap<string, string>;
  backstitchPreview?: BackstitchPreview | null;
};

export function drawPattern({
  canvas,
  pattern,
  viewport,
  width,
  height,
  dmcCodeByHex,
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
  // FULL STITCH DMC NUMBERS
  // ========================================

  if (viewport.zoom >= 0.75) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 9px Arial";

    const halfStitchCells = new Set(
      (pattern.halfStitches ?? []).map((stitch) => `${stitch.x},${stitch.y}`),
    );

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const color = pattern.stitches[y][x];

        if (!color) continue;

        if (halfStitchCells.has(`${x},${y}`)) {
          continue;
        }

        const code = getDmcCode(color, dmcCodeByHex);

        if (!code) continue;

        ctx.fillStyle = getTextColor(color);

        const centerX = x * CELL_SIZE + CELL_SIZE / 2;

        const centerY = y * CELL_SIZE + CELL_SIZE / 2;

        ctx.fillText(code, centerX, centerY, CELL_SIZE - 2);
      }
    }
  }

  // ========================================
  // HALF STITCH DMC NUMBERS
  // ========================================

  if (viewport.zoom >= 1.25) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 7px Arial";

    for (const stitch of pattern.halfStitches ?? []) {
      const code = getDmcCode(stitch.color, dmcCodeByHex);

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
    const { start, end, color } = backstitchPreview;

    const startX = start.x * CELL_SIZE;
    const startY = start.y * CELL_SIZE;

    ctx.save();

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

    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1 / viewport.zoom;

    ctx.beginPath();

    ctx.arc(startX, startY, CELL_SIZE * 0.15, 0, Math.PI * 2);

    ctx.fill();
    ctx.stroke();

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
  // COLUMN NUMBERS
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
  // ROW NUMBERS
  // ========================================

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let y = 0; y < pattern.height; y++) {
    const centerY = y * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillText(String(y + 1), -8, centerY);
  }
}
