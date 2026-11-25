import type {
  CanvasSettings,
  StitchDisplayMode,
} from "../../types/canvasSettings";

type CanvasSettingsPanelProps = {
  settings: CanvasSettings;
  width: number;
  height: number;
  isResizing: boolean;
  onSettingsChange: (updates: Partial<CanvasSettings>) => void;
  onToggleResize: () => void;
  onClose: () => void;
};

const displayModes: {
  id: StitchDisplayMode;
  label: string;
  icon: string;
}[] = [
  { id: "numbers", label: "Numbers", icon: "tag" },
  { id: "symbols", label: "Symbols", icon: "category" },
  { id: "colors", label: "Colors", icon: "palette" },
];

function MaterialIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-sharp" aria-hidden="true">
      {name}
    </span>
  );
}

function CanvasSettingsPanel({
  settings,
  width,
  height,
  isResizing,
  onSettingsChange,
  onToggleResize,
  onClose,
}: CanvasSettingsPanelProps) {
  return (
    <div
      className="canvas-settings-popup tool-popup"
      role="region"
      aria-label="Canvas settings">
      {/* HEADER */}

      <div className="tool-popup-header">
        <div className="settings-heading">
          <MaterialIcon name="settings" />
          <strong>CANVAS SETTINGS</strong>
        </div>

        <button
          type="button"
          className="tool-popup-close"
          onClick={onClose}
          aria-label="Close canvas settings">
          <MaterialIcon name="close" />
        </button>
      </div>

      {/* STITCH DISPLAY */}

      <section className="settings-section">
        <h4 className="settings-section-title">STITCH DISPLAY</h4>

        <div className="settings-display-options">
          {displayModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`settings-display-option ${
                settings.displayMode === mode.id ? "active" : ""
              }`}
              aria-pressed={settings.displayMode === mode.id}
              onClick={() => onSettingsChange({ displayMode: mode.id })}>
              <MaterialIcon name={mode.icon} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CANVAS SIZE */}

      <section className="settings-section">
        <h4 className="settings-section-title">
          <MaterialIcon name="aspect_ratio" />
          CANVAS SIZE
        </h4>

        <div className="settings-dimensions">
          <div className="settings-dimension">
            <MaterialIcon name="width" />

            <div>
              <span>Width</span>
              <strong>{width}</strong>
            </div>
          </div>

          <div className="settings-dimension">
            <MaterialIcon name="height" />

            <div>
              <span>Height</span>
              <strong>{height}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`settings-resize-button ${isResizing ? "active" : ""}`}
          onClick={onToggleResize}
          aria-pressed={isResizing}>
          <MaterialIcon name={isResizing ? "check" : "resize"} />

          {isResizing ? "Done resizing" : "Resize canvas"}
        </button>

        {isResizing && (
          <p className="settings-hint">
            Drag the edges or corners of your canvas to resize it.
          </p>
        )}
      </section>

      {/* GRID SETTINGS */}

      <section className="settings-section">
        <h4 className="settings-section-title">
          <MaterialIcon name="grid_on" />
          GRID SETTINGS
        </h4>

        <button
          type="button"
          className={`settings-toggle ${settings.showGrid ? "active" : ""}`}
          role="switch"
          aria-checked={settings.showGrid}
          onClick={() =>
            onSettingsChange({
              showGrid: !settings.showGrid,
            })
          }>
          <MaterialIcon name={settings.showGrid ? "grid_on" : "grid_off"} />

          <span>Show grid</span>

          <span className="settings-switch" />
        </button>

        <button
          type="button"
          className={`settings-toggle ${
            settings.showMajorGrid ? "active" : ""
          }`}
          role="switch"
          aria-checked={settings.showMajorGrid}
          disabled={!settings.showGrid}
          onClick={() =>
            onSettingsChange({
              showMajorGrid: !settings.showMajorGrid,
            })
          }>
          <MaterialIcon name="grid_4x4" />

          <span>Major grid lines</span>

          <span className="settings-switch" />
        </button>

        <label className="settings-select-label">
          Major grid interval
          <select
            value={settings.majorGridInterval}
            disabled={!settings.showGrid || !settings.showMajorGrid}
            onChange={(event) =>
              onSettingsChange({
                majorGridInterval: Number(event.target.value),
              })
            }>
            <option value={5}>Every 5 stitches</option>
            <option value={10}>Every 10 stitches</option>
            <option value={20}>Every 20 stitches</option>
          </select>
        </label>
      </section>
    </div>
  );
}

export default CanvasSettingsPanel;
