import type { Pattern } from "../../types/pattern";

export function swapColors(
  pattern: Pattern,
  fromColor: string,
  toColor: string,
): Pattern {
  if (fromColor.toLowerCase() === toColor.toLowerCase()) {
    return pattern;
  }

  let hasChanges = false;

  const newStitches = pattern.stitches.map((row) =>
    row.map((color) => {
      if (color?.toLowerCase() === fromColor.toLowerCase()) {
        hasChanges = true;
        return toColor;
      }

      return color;
    }),
  );

  if (!hasChanges) return pattern;

  return {
    ...pattern,
    stitches: newStitches,
  };
}
