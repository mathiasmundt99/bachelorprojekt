import type { Pattern } from "../../types/pattern";
import type { ResizeBounds } from "../../types/canvasResize";

export function resizePattern(pattern: Pattern, bounds: ResizeBounds): Pattern {
  const { left, top, right, bottom } = bounds;

  const width = right - left;
  const height = bottom - top;

  function isInsideCell(x: number, y: number) {
    return x >= left && x < right && y >= top && y < bottom;
  }

  function isInsideGridPoint(x: number, y: number) {
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  // FULL STITCHES

  const stitches = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const oldX = x + left;
      const oldY = y + top;

      return pattern.stitches[oldY]?.[oldX] ?? null;
    }),
  );

  // HALF STITCHES

  const halfStitches = (pattern.halfStitches ?? [])
    .filter((stitch) => isInsideCell(stitch.x, stitch.y))
    .map((stitch) => ({
      ...stitch,
      x: stitch.x - left,
      y: stitch.y - top,
    }));

  // BACKSTITCHES

  const backstitches = (pattern.backstitches ?? [])
    .filter(
      (stitch) =>
        isInsideGridPoint(stitch.startX, stitch.startY) &&
        isInsideGridPoint(stitch.endX, stitch.endY),
    )
    .map((stitch) => ({
      ...stitch,
      startX: stitch.startX - left,
      startY: stitch.startY - top,
      endX: stitch.endX - left,
      endY: stitch.endY - top,
    }));

  // FRENCH KNOTS

  const frenchKnots = (pattern.frenchKnots ?? [])
    .filter((knot) => isInsideGridPoint(knot.x, knot.y))
    .map((knot) => ({
      ...knot,
      x: knot.x - left,
      y: knot.y - top,
    }));

  return {
    ...pattern,
    width,
    height,
    stitches,
    halfStitches,
    backstitches,
    frenchKnots,
  };
}

function countStitches(pattern: Pattern): number {
  const fullStitchCount = pattern.stitches.reduce(
    (total, row) => total + row.filter((color) => color !== null).length,
    0,
  );

  return (
    fullStitchCount +
    (pattern.halfStitches?.length ?? 0) +
    (pattern.backstitches?.length ?? 0) +
    (pattern.frenchKnots?.length ?? 0)
  );
}

export function countRemovedStitches(
  originalPattern: Pattern,
  resizedPattern: Pattern,
): number {
  return countStitches(originalPattern) - countStitches(resizedPattern);
}
