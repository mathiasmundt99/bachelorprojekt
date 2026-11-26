import { useRef, useState } from "react";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { Pattern } from "../types/pattern";

import type {
  ResizeHandle,
  ResizeBounds,
  ResizeDimensions,
} from "../types/canvasResize";

import { CELL_SIZE, type Viewport } from "../utils/canvas/drawPattern";

import {
  resizePattern,
  countRemovedStitches,
} from "../utils/canvas/resizePattern";

const MIN_SIZE = 1;
const MAX_SIZE = 500;

type ResizeDrag = {
  handle: ResizeHandle;
  pointerId: number;
  startX: number;
  startY: number;
  pattern: Pattern;
  viewport: Viewport;
  bounds: ResizeBounds;
};

type UseCanvasResizeOptions = {
  pattern: Pattern;
  viewport: Viewport;
  onPatternChange: (pattern: Pattern) => void;
  onViewportChange: (viewport: Viewport) => void;
  onDimensionsChange: (dimensions: ResizeDimensions | null) => void;
};

export function useCanvasResize({
  pattern,
  viewport,
  onPatternChange,
  onViewportChange,
  onDimensionsChange,
}: UseCanvasResizeOptions) {
  const dragRef = useRef<ResizeDrag | null>(null);

  const [previewBounds, setPreviewBounds] = useState<ResizeBounds | null>(null);

  function startResize(
    event: ReactPointerEvent<HTMLButtonElement>,
    handle: ResizeHandle,
  ) {
    if (event.button !== 0 || dragRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    const bounds = {
      left: 0,
      top: 0,
      right: pattern.width,
      bottom: pattern.height,
    };

    dragRef.current = {
      handle,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pattern,
      viewport,
      bounds,
    };

    setPreviewBounds(bounds);

    onDimensionsChange({
      width: pattern.width,
      height: pattern.height,
    });
  }

  function moveResize(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const scaledCellSize = CELL_SIZE * drag.viewport.zoom;

    const deltaX = Math.round((event.clientX - drag.startX) / scaledCellSize);

    const deltaY = Math.round((event.clientY - drag.startY) / scaledCellSize);

    let left = 0;
    let top = 0;
    let right = drag.pattern.width;
    let bottom = drag.pattern.height;

    if (drag.handle.includes("w")) {
      left = Math.max(right - MAX_SIZE, Math.min(right - MIN_SIZE, deltaX));
    }

    if (drag.handle.includes("e")) {
      right = Math.max(
        MIN_SIZE,
        Math.min(MAX_SIZE, drag.pattern.width + deltaX),
      );
    }

    if (drag.handle.includes("n")) {
      top = Math.max(bottom - MAX_SIZE, Math.min(bottom - MIN_SIZE, deltaY));
    }

    if (drag.handle.includes("s")) {
      bottom = Math.max(
        MIN_SIZE,
        Math.min(MAX_SIZE, drag.pattern.height + deltaY),
      );
    }

    const bounds = {
      left,
      top,
      right,
      bottom,
    };

    drag.bounds = bounds;

    setPreviewBounds(bounds);

    onDimensionsChange({
      width: right - left,
      height: bottom - top,
    });
  }

  function clearResize() {
    dragRef.current = null;
    setPreviewBounds(null);
    onDimensionsChange(null);
  }

  function finishResize(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    const { bounds } = drag;

    const hasChanged =
      bounds.left !== 0 ||
      bounds.top !== 0 ||
      bounds.right !== drag.pattern.width ||
      bounds.bottom !== drag.pattern.height;

    clearResize();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!hasChanged) return;

    const resizedPattern = resizePattern(drag.pattern, bounds);

    const removedStitches = countRemovedStitches(drag.pattern, resizedPattern);

    if (removedStitches > 0) {
      const confirmed = window.confirm(
        `Resizing will remove ${removedStitches} stitch(es). ` +
          "Do you want to continue?",
      );

      if (!confirmed) return;
    }

    onPatternChange(resizedPattern);

    onViewportChange({
      ...drag.viewport,
      offsetX:
        drag.viewport.offsetX + bounds.left * CELL_SIZE * drag.viewport.zoom,
      offsetY:
        drag.viewport.offsetY + bounds.top * CELL_SIZE * drag.viewport.zoom,
    });
  }

  function cancelResize(event?: ReactPointerEvent<HTMLButtonElement>) {
    if (event && dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    clearResize();
  }

  return {
    previewBounds,
    startResize,
    moveResize,
    finishResize,
    cancelResize,
  };
}
