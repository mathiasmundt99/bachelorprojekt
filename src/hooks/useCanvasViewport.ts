import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { CELL_SIZE } from "../utils/canvas/drawPattern";
import type { Viewport } from "../utils/canvas/drawPattern";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const CANVAS_MARGIN = 150;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampViewport(
  next: Viewport,
  patternWidth: number,
  patternHeight: number,
  containerWidth: number,
  containerHeight: number,
): Viewport {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return next;
  }

  const scaledWidth = patternWidth * CELL_SIZE * next.zoom;
  const scaledHeight = patternHeight * CELL_SIZE * next.zoom;

  const minOffsetX = Math.min(
    CANVAS_MARGIN,
    containerWidth - scaledWidth - CANVAS_MARGIN,
  );

  const maxOffsetX = Math.max(
    CANVAS_MARGIN,
    containerWidth - scaledWidth - CANVAS_MARGIN,
  );

  const minOffsetY = Math.min(
    CANVAS_MARGIN,
    containerHeight - scaledHeight - CANVAS_MARGIN,
  );

  const maxOffsetY = Math.max(
    CANVAS_MARGIN,
    containerHeight - scaledHeight - CANVAS_MARGIN,
  );

  return {
    ...next,
    offsetX: clamp(next.offsetX, minOffsetX, maxOffsetX),
    offsetY: clamp(next.offsetY, minOffsetY, maxOffsetY),
  };
}

export function useCanvasViewport(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  patternWidth: number,
  patternHeight: number,
) {
  const [viewport, setViewport] = useState<Viewport>({
    zoom: 1,
    offsetX: 50,
    offsetY: 35,
  });

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const isPanningRef = useRef(false);

  const panStartRef = useRef({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // ========================================
  // OBSERVE CANVAS SIZE
  // ========================================

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;

      setCanvasSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  // ========================================
  // KEEP VIEWPORT WITHIN BOUNDS
  // ========================================

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    setViewport((current) => {
      const next = clampViewport(
        current,
        patternWidth,
        patternHeight,
        canvasSize.width,
        canvasSize.height,
      );

      if (
        next.offsetX === current.offsetX &&
        next.offsetY === current.offsetY
      ) {
        return current;
      }

      return next;
    });
  }, [patternWidth, patternHeight, canvasSize.width, canvasSize.height]);

  // ========================================
  // START PANNING
  // ========================================

  const startPan = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      isPanningRef.current = true;

      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
      };
    },
    [viewport.offsetX, viewport.offsetY],
  );

  // ========================================
  // MOVE PAN
  // ========================================

  const movePan = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isPanningRef.current) return false;

      const deltaX = event.clientX - panStartRef.current.x;
      const deltaY = event.clientY - panStartRef.current.y;

      setViewport((current) =>
        clampViewport(
          {
            ...current,
            offsetX: panStartRef.current.offsetX + deltaX,
            offsetY: panStartRef.current.offsetY + deltaY,
          },
          patternWidth,
          patternHeight,
          canvasSize.width,
          canvasSize.height,
        ),
      );

      return true;
    },
    [patternWidth, patternHeight, canvasSize.width, canvasSize.height],
  );

  // ========================================
  // STOP PANNING
  // ========================================

  const stopPan = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // ========================================
  // TRACKPAD PAN AND ZOOM
  // ========================================

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      // Trackpad-scroll = panorering
      if (!event.ctrlKey) {
        setViewport((current) =>
          clampViewport(
            {
              ...current,
              offsetX: current.offsetX - event.deltaX,
              offsetY: current.offsetY - event.deltaY,
            },
            patternWidth,
            patternHeight,
            canvasSize.width,
            canvasSize.height,
          ),
        );

        return;
      }

      // Trackpad pinch = zoom
      const rect = canvas!.getBoundingClientRect();

      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      setViewport((current) => {
        const patternX = (cursorX - current.offsetX) / current.zoom;

        const patternY = (cursorY - current.offsetY) / current.zoom;

        const zoomFactor = Math.exp(-event.deltaY * 0.01);

        const newZoom = clamp(current.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);

        const newOffsetX = cursorX - patternX * newZoom;
        const newOffsetY = cursorY - patternY * newZoom;

        return clampViewport(
          {
            zoom: newZoom,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
          },
          patternWidth,
          patternHeight,
          canvasSize.width,
          canvasSize.height,
        );
      });
    }

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [
    canvasRef,
    patternWidth,
    patternHeight,
    canvasSize.width,
    canvasSize.height,
  ]);

  return {
    viewport,
    canvasSize,
    startPan,
    movePan,
    stopPan,
  };
}
