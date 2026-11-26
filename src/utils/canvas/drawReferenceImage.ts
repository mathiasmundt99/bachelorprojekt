import type { ReferenceImage } from "../../types/referenceImage";

type DrawReferenceImageOptions = {
  ctx: CanvasRenderingContext2D;

  referenceImage: ReferenceImage | null;
  imageElement: HTMLImageElement | null;

  canvasWidth: number;
  canvasHeight: number;
};

export function drawReferenceImage({
  ctx,
  referenceImage,
  imageElement,
  canvasWidth,
  canvasHeight,
}: DrawReferenceImageOptions) {
  if (!referenceImage || !imageElement) {
    return;
  }

  if (!referenceImage.visible || referenceImage.opacity <= 0) {
    return;
  }

  if (!imageElement.complete || !imageElement.naturalWidth) {
    return;
  }

  if (referenceImage.width <= 0 || referenceImage.height <= 0) {
    return;
  }

  ctx.save();

  // ========================================
  // CLIP IMAGE TO CANVAS
  // ========================================

  ctx.beginPath();

  ctx.rect(0, 0, canvasWidth, canvasHeight);

  ctx.clip();

  // ========================================
  // IMAGE OPACITY
  // ========================================

  ctx.globalAlpha = Math.max(0, Math.min(1, referenceImage.opacity));

  // ========================================
  // IMAGE QUALITY
  // ========================================

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ========================================
  // DRAW IMAGE
  // ========================================

  ctx.drawImage(
    imageElement,
    referenceImage.x,
    referenceImage.y,
    referenceImage.width,
    referenceImage.height,
  );

  ctx.restore();
}
