export type Tool = "pencil" | "eraser" | "fill" | "picker" | "move" | "swap";

export type Pattern = {
  width: number;
  height: number;
  stitches: (string | null)[][];
};
