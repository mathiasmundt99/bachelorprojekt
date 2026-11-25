import type { Pattern } from "../../types/pattern";

export function swapColors(
  pattern: Pattern,
  fromColor: string,
  toColor: string,
): Pattern {
  const normalizedFromColor = fromColor.toLowerCase();

  if (normalizedFromColor === toColor.toLowerCase()) {
    return pattern;
  }

  let hasChanges = false;

  // ========================================
  // SWAP FULL STITCH COLORS
  // ========================================

  const newStitches = pattern.stitches.map((row) =>
    row.map((color) => {
      if (color?.toLowerCase() === normalizedFromColor) {
        hasChanges = true;
        return toColor;
      }

      return color;
    }),
  );

  // ========================================
  // SWAP HALF STITCH COLORS
  // ========================================

  const newHalfStitches = (pattern.halfStitches ?? []).map((stitch) => {
    if (stitch.color.toLowerCase() === normalizedFromColor) {
      hasChanges = true;

      return {
        ...stitch,
        color: toColor,
      };
    }

    return stitch;
  });

  // ========================================
  // SWAP BACKSTITCH COLORS
  // ========================================

  const newBackstitches = (pattern.backstitches ?? []).map((stitch) => {
    if (stitch.color.toLowerCase() === normalizedFromColor) {
      hasChanges = true;

      return {
        ...stitch,
        color: toColor,
      };
    }

    return stitch;
  });

  // ========================================
  // SWAP FRENCH KNOT COLORS
  // ========================================

  const newFrenchKnots = (pattern.frenchKnots ?? []).map((knot) => {
    if (knot.color.toLowerCase() === normalizedFromColor) {
      hasChanges = true;

      return {
        ...knot,
        color: toColor,
      };
    }

    return knot;
  });

  // ========================================
  // RETURN UPDATED PATTERN
  // ========================================

  if (!hasChanges) return pattern;

  return {
    ...pattern,
    stitches: newStitches,
    halfStitches: newHalfStitches,
    backstitches: newBackstitches,
    frenchKnots: newFrenchKnots,
  };
}
