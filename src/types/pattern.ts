export type Tool =
  | "pencil"
  | "eraser"
  | "fill"
  | "eyedropper"
  | "move"
  | "swap";

export type Pattern = {
  width: number;
  height: number;
  stitches: (string | null)[][];
};
