import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_REFERENCE_IMAGE_OPACITY,
  type ReferenceImage,
  type ReferenceImageMode,
  type ReferenceImageTransform,
} from "../types/referenceImage";

import { CELL_SIZE } from "../utils/canvas/drawPattern";

// ========================================
// CONSTANTS
// ========================================

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// ========================================
// HELPERS
// ========================================

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () => {
      reject(new Error("Could not load image."));
    };

    image.src = src;
  });
}

// ========================================
// FIT IMAGE TO CANVAS
// ========================================

function fitImageToCanvas(
  naturalWidth: number,
  naturalHeight: number,
  patternWidth: number,
  patternHeight: number,
): ReferenceImageTransform {
  const canvasWidth = patternWidth * CELL_SIZE;
  const canvasHeight = patternHeight * CELL_SIZE;

  const scale = Math.min(
    canvasWidth / naturalWidth,
    canvasHeight / naturalHeight,
  );

  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
    width,
    height,
  };
}

// ========================================
// REFERENCE IMAGE HOOK
// ========================================

export function useReferenceImage(patternWidth: number, patternHeight: number) {
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(
    null,
  );

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );

  const [imageMode, setImageMode] = useState<ReferenceImageMode>("move");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const imageUrlRef = useRef<string | null>(null);

  const pendingUrlRef = useRef<string | null>(null);

  const uploadIdRef = useRef(0);

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      uploadIdRef.current += 1;

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }

      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    };
  }, []);

  // ========================================
  // UPLOAD IMAGE
  // ========================================

  async function uploadImage(file: File) {
    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a PNG, JPG or WebP image.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 20 MB.");

      return;
    }

    const uploadId = ++uploadIdRef.current;

    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
    }

    const imageUrl = URL.createObjectURL(file);

    pendingUrlRef.current = imageUrl;

    try {
      setLoading(true);

      const loadedImage = await loadImage(imageUrl);

      if (uploadId !== uploadIdRef.current) {
        URL.revokeObjectURL(imageUrl);
        return;
      }

      if (!loadedImage.naturalWidth || !loadedImage.naturalHeight) {
        throw new Error("Invalid image dimensions.");
      }

      const transform = fitImageToCanvas(
        loadedImage.naturalWidth,
        loadedImage.naturalHeight,
        patternWidth,
        patternHeight,
      );

      const nextImage: ReferenceImage = {
        id: crypto.randomUUID(),

        name: file.name,
        src: imageUrl,

        naturalWidth: loadedImage.naturalWidth,
        naturalHeight: loadedImage.naturalHeight,

        ...transform,

        opacity: DEFAULT_REFERENCE_IMAGE_OPACITY,

        locked: false,
        visible: true,
      };

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }

      imageUrlRef.current = imageUrl;
      pendingUrlRef.current = null;

      setReferenceImage(nextImage);
      setImageElement(loadedImage);
      setImageMode("move");
    } catch (err) {
      URL.revokeObjectURL(imageUrl);

      if (uploadId !== uploadIdRef.current) {
        return;
      }

      pendingUrlRef.current = null;

      console.error("Image upload error:", err);

      setError("Could not load the selected image.");
    } finally {
      if (uploadId === uploadIdRef.current) {
        setLoading(false);
      }
    }
  }

  // ========================================
  // UPDATE TRANSFORM
  // ========================================

  function updateImageTransform(updates: Partial<ReferenceImageTransform>) {
    setReferenceImage((current) => {
      if (!current || current.locked) {
        return current;
      }

      return {
        ...current,
        ...updates,
      };
    });
  }

  // ========================================
  // MOVE IMAGE
  // ========================================

  function moveImage(x: number, y: number) {
    updateImageTransform({
      x,
      y,
    });
  }

  // ========================================
  // RESIZE IMAGE
  // ========================================

  function resizeImage(transform: ReferenceImageTransform) {
    updateImageTransform(transform);
  }

  // ========================================
  // OPACITY
  // ========================================

  function setImageOpacity(opacity: number) {
    setReferenceImage((current) => {
      if (!current) return null;

      return {
        ...current,
        opacity: clamp(opacity, 0, 1),
      };
    });
  }

  // ========================================
  // LOCK
  // ========================================

  function toggleImageLock() {
    setReferenceImage((current) => {
      if (!current) return null;

      return {
        ...current,
        locked: !current.locked,
      };
    });
  }

  // ========================================
  // VISIBILITY
  // ========================================

  function toggleImageVisibility() {
    setReferenceImage((current) => {
      if (!current) return null;

      return {
        ...current,
        visible: !current.visible,
      };
    });
  }

  // ========================================
  // RESET IMAGE TRANSFORM
  // ========================================

  function resetImageTransform() {
    setReferenceImage((current) => {
      if (!current || current.locked) {
        return current;
      }

      const transform = fitImageToCanvas(
        current.naturalWidth,
        current.naturalHeight,
        patternWidth,
        patternHeight,
      );

      return {
        ...current,
        ...transform,
      };
    });
  }

  // ========================================
  // SHIFT IMAGE WITH CANVAS RESIZE
  // ========================================

  function shiftImage(deltaX: number, deltaY: number) {
    setReferenceImage((current) => {
      if (!current) return null;

      return {
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY,
      };
    });
  }

  // ========================================
  // REMOVE IMAGE
  // ========================================

  function removeImage() {
    uploadIdRef.current += 1;

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }

    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }

    setReferenceImage(null);
    setImageElement(null);
    setImageMode("move");
    setLoading(false);
    setError("");
  }

  // ========================================
  // RETURN
  // ========================================

  return {
    referenceImage,
    imageElement,

    imageMode,
    setImageMode,

    loading,
    error,

    uploadImage,

    updateImageTransform,
    moveImage,
    resizeImage,

    setImageOpacity,
    toggleImageLock,
    toggleImageVisibility,

    resetImageTransform,
    shiftImage,
    removeImage,
  };
}
