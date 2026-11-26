import { useRef } from "react";

import type {
  ReferenceImage,
  ReferenceImageMode,
} from "../../types/referenceImage";

// ========================================
// TYPES
// ========================================

type ImageToolPanelProps = {
  referenceImage: ReferenceImage | null;

  mode: ReferenceImageMode;

  loading: boolean;
  error: string;

  isDragging: boolean;

  onUpload: (file: File) => void;
  onModeChange: (mode: ReferenceImageMode) => void;

  onOpacityChange: (opacity: number) => void;

  onToggleLock: () => void;
  onToggleVisibility: () => void;

  onReset: () => void;
  onRemove: () => void;
  onClose: () => void;
};

// ========================================
// MATERIAL ICON
// ========================================

function MaterialIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-sharp" aria-hidden="true">
      {name}
    </span>
  );
}

// ========================================
// COMPONENT
// ========================================

function ImageToolPanel({
  referenceImage,
  mode,
  loading,
  error,
  isDragging,
  onUpload,
  onModeChange,
  onOpacityChange,
  onToggleLock,
  onToggleVisibility,
  onReset,
  onRemove,
  onClose,
}: ImageToolPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const controlsDisabled = loading || isDragging;

  const transformDisabled =
    controlsDisabled || referenceImage?.locked || !referenceImage?.visible;

  // ========================================
  // UPLOAD
  // ========================================

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onUpload(file);
    }

    event.target.value = "";
  }

  // ========================================
  // REMOVE
  // ========================================

  function handleRemove() {
    if (!referenceImage) return;

    const confirmed = window.confirm("Remove the reference image?");

    if (confirmed) {
      onRemove();
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className="image-tool-popup tool-popup"
      role="region"
      aria-label="Reference image settings">
      {/* HEADER */}

      <div className="tool-popup-header">
        <div className="image-tool-heading">
          <MaterialIcon name="image" />

          <strong>REFERENCE IMAGE</strong>
        </div>

        <button
          type="button"
          className="tool-popup-close"
          title="Close image tool"
          aria-label="Close image tool"
          disabled={isDragging}
          onClick={onClose}>
          <MaterialIcon name="close" />
        </button>
      </div>

      {/* HIDDEN FILE INPUT */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        hidden
      />

      {/* IMAGE PREVIEW */}

      <div className="image-tool-preview">
        {referenceImage ? (
          <>
            <img
              src={referenceImage.src}
              alt="Reference image"
              draggable={false}
            />

            <div className="image-tool-filename" title={referenceImage.name}>
              {referenceImage.name}
            </div>
          </>
        ) : (
          <div className="image-tool-empty">
            <MaterialIcon name="add_photo_alternate" />

            <strong>No reference image</strong>

            <span>Upload an image to use as a reference for your pattern.</span>
          </div>
        )}
      </div>

      {/* UPLOAD BUTTON */}

      <button
        type="button"
        className="image-tool-upload"
        disabled={controlsDisabled}
        onClick={openFilePicker}>
        <MaterialIcon name={referenceImage ? "image_search" : "upload"} />

        {loading
          ? "Loading image..."
          : referenceImage
            ? "Replace image"
            : "Upload image"}
      </button>

      <p className="image-tool-file-hint">PNG, JPG or WebP · Max 20 MB</p>

      {/* ERROR */}

      {error && (
        <div className="image-tool-error" role="alert">
          <MaterialIcon name="error" />

          <span>{error}</span>
        </div>
      )}

      {/* IMAGE SETTINGS */}

      {referenceImage && (
        <>
          {/* OPACITY */}

          <section className="image-tool-section">
            <div className="image-tool-section-header">
              <label htmlFor="reference-image-opacity">
                <MaterialIcon name="opacity" />
                Opacity
              </label>

              <strong>{Math.round(referenceImage.opacity * 100)}%</strong>
            </div>

            <input
              id="reference-image-opacity"
              className="image-opacity-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(referenceImage.opacity * 100)}
              disabled={controlsDisabled}
              onChange={(event) =>
                onOpacityChange(Number(event.target.value) / 100)
              }
            />

            <div className="image-opacity-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </section>

          {/* TRANSFORM */}

          <section className="image-tool-section">
            <h4 className="image-tool-section-title">
              <MaterialIcon name="transform" />
              TRANSFORM
            </h4>

            <div className="image-tool-actions">
              <button
                type="button"
                className={`image-tool-action ${
                  mode === "move" && !referenceImage.locked ? "active" : ""
                }`}
                aria-pressed={mode === "move"}
                disabled={transformDisabled}
                onClick={() => onModeChange("move")}>
                <MaterialIcon name="open_with" />
                Move
              </button>

              <button
                type="button"
                className={`image-tool-action ${
                  mode === "resize" && !referenceImage.locked ? "active" : ""
                }`}
                aria-pressed={mode === "resize"}
                disabled={transformDisabled}
                onClick={() => onModeChange("resize")}>
                <MaterialIcon name="resize" />
                Resize
              </button>

              <button
                type="button"
                className={`image-tool-action ${
                  referenceImage.locked ? "active" : ""
                }`}
                aria-pressed={referenceImage.locked}
                disabled={controlsDisabled}
                onClick={onToggleLock}>
                <MaterialIcon
                  name={referenceImage.locked ? "lock" : "lock_open"}
                />

                {referenceImage.locked ? "Unlock" : "Lock"}
              </button>

              <button
                type="button"
                className="image-tool-action"
                disabled={controlsDisabled || referenceImage.locked}
                onClick={onReset}>
                <MaterialIcon name="restart_alt" />
                Reset
              </button>
            </div>

            <p className="image-tool-hint">
              {!referenceImage.visible
                ? "Show the image to edit its position."
                : referenceImage.locked
                  ? "The image position and size are locked."
                  : mode === "move"
                    ? "Drag the image to change its position."
                    : "Drag a corner to resize the image."}
            </p>
          </section>

          {/* VISIBILITY */}

          <section className="image-tool-section">
            <button
              type="button"
              className={`image-tool-visibility ${
                referenceImage.visible ? "active" : ""
              }`}
              role="switch"
              aria-checked={referenceImage.visible}
              aria-label="Show reference image"
              disabled={controlsDisabled}
              onClick={onToggleVisibility}>
              <MaterialIcon
                name={referenceImage.visible ? "visibility" : "visibility_off"}
              />

              <span>Show image</span>

              <span className="settings-switch" aria-hidden="true" />
            </button>
          </section>

          {/* REMOVE */}

          <button
            type="button"
            className="image-tool-remove"
            disabled={controlsDisabled}
            onClick={handleRemove}>
            <MaterialIcon name="delete" />
            Remove image
          </button>
        </>
      )}
    </div>
  );
}

export default ImageToolPanel;
