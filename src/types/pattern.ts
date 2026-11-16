export type Tool =
  | "pencil"
  | "eraser"
  | "fill"
  | "eyedropper"
  | "move"
  | "swap"
  | "half-stitch"
  | "backstitch"
  | "french-knot";

export type HalfStitchDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type HalfStitch = {
  x: number;
  y: number;
  color: string;
  direction: HalfStitchDirection;
};

export type Backstitch = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
};

export type FrenchKnot = {
  x: number;
  y: number;
  color: string;
};

export type Pattern = {
  width: number;
  height: number;
  stitches: (string | null)[][];

  halfStitches?: HalfStitch[];
  backstitches?: Backstitch[];
  frenchKnots?: FrenchKnot[];
};
