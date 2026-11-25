import type { DMCColor } from "../../services/colorPaletteService";

export function createDmcCodeMap(
  colors: DMCColor[],
): ReadonlyMap<string, string> {
  return new Map(colors.map((color) => [color.hex.toLowerCase(), color.code]));
}

export function getDmcCode(
  hex: string | null,
  dmcCodeByHex: ReadonlyMap<string, string>,
): string {
  if (!hex) return "";

  return dmcCodeByHex.get(hex.toLowerCase()) ?? "";
}

export function getTextColor(hex: string): string {
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
