export type StitchDisplayMode = "numbers" | "symbols" | "colors";

export type CanvasSettings = {
  displayMode: StitchDisplayMode;
  showGrid: boolean;
  showMajorGrid: boolean;
  majorGridInterval: number;
};

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  displayMode: "numbers",
  showGrid: true,
  showMajorGrid: true,
  majorGridInterval: 10,
};
