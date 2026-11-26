export type ReferenceImage = {
  id: string;
  name: string;
  src: string;

  naturalWidth: number;
  naturalHeight: number;

  x: number;
  y: number;

  width: number;
  height: number;

  opacity: number;
  locked: boolean;
  visible: boolean;
};

export type ReferenceImageMode = "move" | "resize";

export type ReferenceImageTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ReferenceImageResizeHandle = "nw" | "ne" | "se" | "sw";

export const DEFAULT_REFERENCE_IMAGE_OPACITY = 0.5;
