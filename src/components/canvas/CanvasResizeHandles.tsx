import type { PointerEvent as ReactPointerEvent } from "react";

import type { ResizeHandle, ResizeBounds } from "../../types/canvasResize";

import { CELL_SIZE, type Viewport } from "../../utils/canvas/drawPattern";

type CanvasResizeHandlesProps = {
  width: number;
  height: number;
  viewport: Viewport;
  previewBounds: ResizeBounds | null;

  onResizeStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    handle: ResizeHandle,
  ) => void;

  onResizeMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;

  onResizeEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;

  onResizeCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

const handles: {
  id: ResizeHandle;
  label: string;
  x: number;
  y: number;
}[] = [
  { id: "nw", label: "Top left", x: 0, y: 0 },
  { id: "n", label: "Top", x: 50, y: 0 },
  { id: "ne", label: "Top right", x: 100, y: 0 },
  { id: "e", label: "Right", x: 100, y: 50 },
  { id: "se", label: "Bottom right", x: 100, y: 100 },
  { id: "s", label: "Bottom", x: 50, y: 100 },
  { id: "sw", label: "Bottom left", x: 0, y: 100 },
  { id: "w", label: "Left", x: 0, y: 50 },
];

function CanvasResizeHandles({
  width,
  height,
  viewport,
  previewBounds,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onResizeCancel,
}: CanvasResizeHandlesProps) {
  const bounds = previewBounds ?? {
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  };

  const scaledCellSize = CELL_SIZE * viewport.zoom;

  const resizeWidth = bounds.right - bounds.left;
  const resizeHeight = bounds.bottom - bounds.top;

  return (
    <div
      className={`canvas-resize-outline ${previewBounds ? "dragging" : ""}`}
      style={{
        left: viewport.offsetX + bounds.left * scaledCellSize,

        top: viewport.offsetY + bounds.top * scaledCellSize,

        width: resizeWidth * scaledCellSize,
        height: resizeHeight * scaledCellSize,
      }}>
      <div className="canvas-resize-dimensions">
        {resizeWidth} × {resizeHeight}
      </div>

      {handles.map((handle) => (
        <button
          key={handle.id}
          type="button"
          className={`canvas-resize-handle resize-${handle.id}`}
          style={{
            left: `${handle.x}%`,
            top: `${handle.y}%`,
          }}
          title={`Resize ${handle.label.toLowerCase()}`}
          aria-label={`Resize ${handle.label.toLowerCase()}`}
          onPointerDown={(event) => onResizeStart(event, handle.id)}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeCancel}
          onLostPointerCapture={onResizeCancel}
        />
      ))}
    </div>
  );
}

export default CanvasResizeHandles;
