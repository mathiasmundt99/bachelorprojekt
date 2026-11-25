import type { Pattern } from "../../types/pattern";
import type { CanvasSettings } from "../../types/canvasSettings";

import { getDmcCode, getTextColor } from "../colors/colorUtils";
import { getStitchSymbol } from "./stitchSymbols";

type DrawStitchLabelsOptions = {
  ctx: CanvasRenderingContext2D;
  pattern: Pattern;
  settings: CanvasSettings;
  cellSize: number;
  zoom: number;
  dmcCodeByHex: ReadonlyMap<string, string>;
  stitchSymbols: ReadonlyMap<string, string>;
};

export function drawStitchLabels({
  ctx,
  pattern,
  settings,
  cellSize,
  zoom,
  dmcCodeByHex,
  stitchSymbols,
}: DrawStitchLabelsOptions) {
  if (settings.displayMode === "colors") return;

  function getLabel(color: string): string {
    if (settings.displayMode === "symbols") {
      return getStitchSymbol(color, stitchSymbols);
    }

    return getDmcCode(color, dmcCodeByHex);
  }

  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const halfStitchCells = new Set(
    (pattern.halfStitches ?? []).map((stitch) => `${stitch.x},${stitch.y}`),
  );

  // ========================================
  // FULL STITCH LABELS
  // ========================================

  if (zoom >= 0.75) {
    ctx.font =
      settings.displayMode === "symbols" ? "bold 14px Arial" : "bold 9px Arial";

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const color = pattern.stitches[y][x];

        if (!color) continue;

        if (halfStitchCells.has(`${x},${y}`)) {
          continue;
        }

        const label = getLabel(color);

        if (!label) continue;

        ctx.fillStyle = getTextColor(color);

        ctx.fillText(
          label,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          cellSize - 2,
        );
      }
    }
  }

  // ========================================
  // HALF STITCH LABELS
  // ========================================

  if (zoom >= 1.25) {
    ctx.font =
      settings.displayMode === "symbols" ? "bold 10px Arial" : "bold 7px Arial";

    for (const stitch of pattern.halfStitches ?? []) {
      const label = getLabel(stitch.color);

      if (!label) continue;

      let offsetX = 0;
      let offsetY = 0;

      switch (stitch.direction) {
        case "top-left":
          offsetX = 1 / 3;
          offsetY = 1 / 3;
          break;

        case "top-right":
          offsetX = 2 / 3;
          offsetY = 1 / 3;
          break;

        case "bottom-left":
          offsetX = 1 / 3;
          offsetY = 2 / 3;
          break;

        case "bottom-right":
          offsetX = 2 / 3;
          offsetY = 2 / 3;
          break;
      }

      ctx.fillStyle = getTextColor(stitch.color);

      ctx.fillText(
        label,
        (stitch.x + offsetX) * cellSize,
        (stitch.y + offsetY) * cellSize,
        cellSize * 0.5,
      );
    }
  }

  ctx.restore();
}
