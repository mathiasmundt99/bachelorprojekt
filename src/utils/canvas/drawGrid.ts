import type { Pattern } from "../../types/pattern";
import type { CanvasSettings } from "../../types/canvasSettings";

type DrawGridOptions = {
  ctx: CanvasRenderingContext2D;
  pattern: Pattern;
  settings: CanvasSettings;
  cellSize: number;
  zoom: number;
};

export function drawGrid({
  ctx,
  pattern,
  settings,
  cellSize,
  zoom,
}: DrawGridOptions) {
  if (!settings.showGrid) return;

  ctx.save();

  // VERTICAL GRID LINES
  for (let x = 0; x <= pattern.width; x++) {
    const isMajor =
      settings.showMajorGrid && x % settings.majorGridInterval === 0;

    ctx.strokeStyle = isMajor ? "#222222" : "#b8b8b8";
    ctx.lineWidth = (isMajor ? 2 : 1) / zoom;

    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, pattern.height * cellSize);
    ctx.stroke();
  }

  // HORIZONTAL GRID LINES
  for (let y = 0; y <= pattern.height; y++) {
    const isMajor =
      settings.showMajorGrid && y % settings.majorGridInterval === 0;

    ctx.strokeStyle = isMajor ? "#222222" : "#b8b8b8";
    ctx.lineWidth = (isMajor ? 2 : 1) / zoom;

    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(pattern.width * cellSize, y * cellSize);
    ctx.stroke();
  }

  ctx.restore();
}
