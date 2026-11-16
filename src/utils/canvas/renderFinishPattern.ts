import type { Pattern } from "../../types/pattern";
import dmcColors from "../../data/dmc-colors.json";

export type FinishDisplayMode = "numbers" | "symbols" | "colors";

export type FinishColor = {
  hex: string;
  code: string;
  name: string;
  count: number;
  symbol: string;
};

const CELL_SIZE = 24;

const SYMBOLS = [
  "●",
  "■",
  "▲",
  "◆",
  "✚",
  "✦",
  "★",
  "○",
  "□",
  "△",
  "◇",
  "×",
  "+",
  "=",
  "#",
  "@",
  "%",
  "&",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "M",
  "N",
  "P",
  "R",
];

export function getFinishColors(pattern: Pattern): FinishColor[] {
  const counts = new Map<string, number>();

  for (const row of pattern.stitches) {
    for (const color of row) {
      if (!color) continue;

      const hex = color.toLowerCase();
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([a], [b]) => {
      const aCode =
        dmcColors.find((item) => item.hex.toLowerCase() === a)?.code ?? a;
      const bCode =
        dmcColors.find((item) => item.hex.toLowerCase() === b)?.code ?? b;

      return aCode.localeCompare(bCode, undefined, { numeric: true });
    })
    .map(([hex, count], index) => {
      const dmc = dmcColors.find((item) => item.hex.toLowerCase() === hex);

      return {
        hex,
        code: dmc?.code ?? hex,
        name: dmc?.name ?? "Custom color",
        count,
        symbol: SYMBOLS[index % SYMBOLS.length],
      };
    });
}

function textColor(hex: string): string {
  const value = hex.replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(value)) {
    return "#202020";
  }

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 < 150 ? "#ffffff" : "#202020";
}

type RenderOptions = {
  canvas: HTMLCanvasElement;
  pattern: Pattern;
  colors: FinishColor[];
  mode: FinishDisplayMode;
  highlightedHex: string | null;
  cellSize?: number;
};

export function renderFinishPattern({
  canvas,
  pattern,
  colors,
  mode,
  highlightedHex,
  cellSize = CELL_SIZE,
}: RenderOptions) {
  canvas.width = pattern.width * cellSize;
  canvas.height = pattern.height * cellSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const colorLookup = new Map(colors.map((color) => [color.hex, color]));

  for (let y = 0; y < pattern.height; y++) {
    for (let x = 0; x < pattern.width; x++) {
      const originalHex = pattern.stitches[y][x];
      if (!originalHex) continue;

      const hex = originalHex.toLowerCase();
      const info = colorLookup.get(hex);

      const isDimmed = highlightedHex !== null && highlightedHex !== hex;

      const left = x * cellSize;
      const top = y * cellSize;

      ctx.fillStyle = isDimmed ? "#f0f0f0" : originalHex;
      ctx.fillRect(left, top, cellSize, cellSize);

      if (isDimmed || !info || mode === "colors") continue;

      ctx.fillStyle = textColor(originalHex);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (mode === "numbers") {
        ctx.font = `bold ${cellSize * 0.39}px Arial`;
        ctx.fillText(
          info.code,
          left + cellSize / 2,
          top + cellSize / 2,
          cellSize - 2,
        );
      } else {
        ctx.font = `bold ${cellSize * 0.65}px Arial`;
        ctx.fillText(info.symbol, left + cellSize / 2, top + cellSize / 2);
      }
    }
  }

  // Grid lines
  for (let x = 0; x <= pattern.width; x++) {
    const major = x % 10 === 0;

    ctx.beginPath();
    ctx.strokeStyle = major ? "#444444" : "#c5c5c5";
    ctx.lineWidth = major ? 1.6 : 0.5;
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= pattern.height; y++) {
    const major = y % 10 === 0;

    ctx.beginPath();
    ctx.strokeStyle = major ? "#444444" : "#c5c5c5";
    ctx.lineWidth = major ? 1.6 : 0.5;
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvas.width, y * cellSize);
    ctx.stroke();
  }
}
