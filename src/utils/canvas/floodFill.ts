import type { Pattern } from "../../types/pattern";

export function floodFill(
  pattern: Pattern,
  startX: number,
  startY: number,
  selectedColor: string,
): Pattern {
  const targetColor = pattern.stitches[startY][startX];

  // Gør ingenting, hvis feltet allerede har den valgte farve
  if (targetColor === selectedColor) {
    return pattern;
  }

  // Kopiér mønsteret, så vi ikke ændrer React state direkte
  const newStitches = pattern.stitches.map((row) => [...row]);

  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;

    // Spring felter uden for mønsteret over
    if (x < 0 || x >= pattern.width || y < 0 || y >= pattern.height) {
      continue;
    }

    // Udfyld kun felter med den oprindelige farve
    if (newStitches[y][x] !== targetColor) {
      continue;
    }

    // Farv feltet
    newStitches[y][x] = selectedColor;

    // Undersøg naboerne vandret og lodret
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return {
    ...pattern,
    stitches: newStitches,
  };
}
