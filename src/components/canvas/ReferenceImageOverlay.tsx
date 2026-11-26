import { useEffect, useRef, useState } from "react";

import type { PointerEvent as ReactPointerEvent } from "react";

import type {
  ReferenceImage,
  ReferenceImageMode,
  ReferenceImageTransform,
  ReferenceImageResizeHandle,
} from "../../types/referenceImage";

import type { Viewport } from "../../utils/canvas/drawPattern";

// ========================================
// TYPES
// ========================================

type ReferenceImageOverlayProps = {
  referenceImage: ReferenceImage;
  viewport: Viewport;
  mode: ReferenceImageMode;

  onTransformChange: (transform: ReferenceImageTransform) => void;

  onDraggingChange: (dragging: boolean) => void;
};

type DragState = {
  mode: ReferenceImageMode;

  handle?: ReferenceImageResizeHandle;

  pointerId: number;

  startX: number;
  startY: number;

  zoom: number;

  transform: ReferenceImageTransform;

  target: HTMLElement;
};

// ========================================
// CONSTANTS
// ========================================

const MIN_IMAGE_SIZE = 12;

const RESIZE_HANDLES: {
  id: ReferenceImageResizeHandle;
  x: number;
  y: number;
  label: string;
}[] = [
  {
    id: "nw",
    x: 0,
    y: 0,
    label: "Resize top left",
  },
  {
    id: "ne",
    x: 100,
    y: 0,
    label: "Resize top right",
  },
  {
    id: "se",
    x: 100,
    y: 100,
    label: "Resize bottom right",
  },
  {
    id: "sw",
    x: 0,
    y: 100,
    label: "Resize bottom left",
  },
];

// ========================================
// COMPONENT
// ========================================

function ReferenceImageOverlay({
  referenceImage,
  viewport,
  mode,
  onTransformChange,
  onDraggingChange,
}: ReferenceImageOverlayProps) {
  const dragRef = useRef<DragState | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const callbacksRef = useRef({
    onTransformChange,
    onDraggingChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTransformChange,
      onDraggingChange,
    };
  }, [onTransformChange, onDraggingChange]);

  // ========================================
  // START DRAG
  // ========================================

  function startDrag(
    event: ReactPointerEvent<HTMLElement>,
    dragMode: ReferenceImageMode,
    handle?: ReferenceImageResizeHandle,
  ) {
    if (
      event.button !== 0 ||
      referenceImage.locked ||
      !referenceImage.visible ||
      dragRef.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      mode: dragMode,
      handle,

      pointerId: event.pointerId,

      startX: event.clientX,
      startY: event.clientY,

      zoom: viewport.zoom,

      transform: {
        x: referenceImage.x,
        y: referenceImage.y,
        width: referenceImage.width,
        height: referenceImage.height,
      },

      target: event.currentTarget,
    };

    setIsDragging(true);
    onDraggingChange(true);
  }

  // ========================================
  // PROPORTIONAL RESIZE
  // ========================================

  function calculateResize(
    drag: DragState,
    deltaX: number,
    deltaY: number,
  ): ReferenceImageTransform {
    const original = drag.transform;

    const handle = drag.handle;

    if (!handle) return original;

    const isLeft = handle === "nw" || handle === "sw";

    const isTop = handle === "nw" || handle === "ne";

    const directionX = isLeft ? -1 : 1;
    const directionY = isTop ? -1 : 1;

    const vectorX = original.width * directionX;

    const vectorY = original.height * directionY;

    const lengthSquared = vectorX * vectorX + vectorY * vectorY;

    if (lengthSquared <= 0) return original;

    const scaleChange = (deltaX * vectorX + deltaY * vectorY) / lengthSquared;

    const minScale = Math.max(
      MIN_IMAGE_SIZE / original.width,
      MIN_IMAGE_SIZE / original.height,
    );

    const scale = Math.max(minScale, 1 + scaleChange);

    const width = original.width * scale;
    const height = original.height * scale;

    return {
      x: isLeft ? original.x + original.width - width : original.x,

      y: isTop ? original.y + original.height - height : original.y,

      width,
      height,
    };
  }

  // ========================================
  // MOVE DRAG
  // ========================================

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const deltaX = (event.clientX - drag.startX) / drag.zoom;

    const deltaY = (event.clientY - drag.startY) / drag.zoom;

    if (drag.mode === "move") {
      onTransformChange({
        ...drag.transform,

        x: drag.transform.x + deltaX,
        y: drag.transform.y + deltaY,
      });

      return;
    }

    if (drag.mode === "resize") {
      const transform = calculateResize(drag, deltaX, deltaY);

      onTransformChange(transform);
    }
  }

  // ========================================
  // FINISH DRAG
  // ========================================

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    event.stopPropagation();

    dragRef.current = null;

    setIsDragging(false);
    onDraggingChange(false);

    if (drag.target.hasPointerCapture(drag.pointerId)) {
      drag.target.releasePointerCapture(drag.pointerId);
    }
  }

  // ========================================
  // CANCEL DRAG
  // ========================================

  function cancelDrag() {
    const drag = dragRef.current;

    if (!drag) return;

    dragRef.current = null;

    onTransformChange(drag.transform);

    setIsDragging(false);
    onDraggingChange(false);

    if (drag.target.hasPointerCapture(drag.pointerId)) {
      drag.target.releasePointerCapture(drag.pointerId);
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    cancelDrag();
  }

  // ========================================
  // KEYBOARD & CLEANUP
  // ========================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      const drag = dragRef.current;

      if (!drag) return;

      event.preventDefault();

      dragRef.current = null;

      callbacksRef.current.onTransformChange(drag.transform);

      callbacksRef.current.onDraggingChange(false);

      setIsDragging(false);

      if (drag.target.hasPointerCapture(drag.pointerId)) {
        drag.target.releasePointerCapture(drag.pointerId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      const drag = dragRef.current;

      dragRef.current = null;

      if (drag) {
        callbacksRef.current.onDraggingChange(false);

        if (drag.target.hasPointerCapture(drag.pointerId)) {
          drag.target.releasePointerCapture(drag.pointerId);
        }
      }
    };
  }, []);

  // ========================================
  // SCREEN POSITION
  // ========================================

  const left = viewport.offsetX + referenceImage.x * viewport.zoom;

  const top = viewport.offsetY + referenceImage.y * viewport.zoom;

  const width = referenceImage.width * viewport.zoom;

  const height = referenceImage.height * viewport.zoom;

  // ========================================
  // RENDER
  // ========================================

  if (!referenceImage.visible) {
    return null;
  }

  return (
    <div
      className={[
        "reference-image-overlay",
        `image-mode-${mode}`,
        isDragging ? "dragging" : "",
        referenceImage.locked ? "locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left,
        top,
        width,
        height,
      }}>
      <div className="reference-image-label">
        <span className="material-symbols-sharp">
          {referenceImage.locked ? "lock" : "image"}
        </span>

        <span>{referenceImage.name}</span>
      </div>

      {!referenceImage.locked && mode === "move" && (
        <div
          className="reference-image-move-area"
          onPointerDown={(event) => startDrag(event, "move")}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handlePointerCancel}
        />
      )}

      {!referenceImage.locked &&
        mode === "resize" &&
        RESIZE_HANDLES.map((handle) => (
          <button
            key={handle.id}
            type="button"
            className={`reference-image-handle ` + `resize-${handle.id}`}
            style={{
              left: `${handle.x}%`,
              top: `${handle.y}%`,
            }}
            title={handle.label}
            aria-label={handle.label}
            onPointerDown={(event) => startDrag(event, "resize", handle.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handlePointerCancel}
          />
        ))}
    </div>
  );
}

export default ReferenceImageOverlay;
