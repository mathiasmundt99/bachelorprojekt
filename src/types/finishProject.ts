import type { Pattern } from "./pattern";

export type FinishProjectState = {
  projectId: number;
  projectName: string;

  width: number;
  height: number;

  fabricCount: number;
  fabricColor: string;

  selectedPalette: string;

  pattern: Pattern;
};
