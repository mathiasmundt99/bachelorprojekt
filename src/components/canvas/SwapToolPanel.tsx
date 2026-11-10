import "../../styles/modals/SwapToolPanel.css";

type SwapToolPanelProps = {
  fromColor: string | null;
  toColor: string | null;
  onReset: () => void;
};

function SwapToolPanel({ fromColor, toColor, onReset }: SwapToolPanelProps) {
  return (
    <div className="swap-tool-panel">
      <div className="swap-panel-header">
        <h3>Swap colors</h3>

        <button type="button" className="swap-reset-button" onClick={onReset}>
          Reset
        </button>
      </div>

      <p className="swap-panel-description">
        {!fromColor
          ? "Click a stitch on the canvas to choose the color you want to replace."
          : "Now choose a replacement color from the palette on the right."}
      </p>

      <div className="swap-color-row">
        <div className="swap-color-item">
          <div
            className={`swap-color-box ${!fromColor ? "empty" : ""}`}
            style={fromColor ? { backgroundColor: fromColor } : undefined}
          />

          <span>From</span>
        </div>

        <span className="swap-arrow">→</span>

        <div className="swap-color-item">
          <div
            className={`swap-color-box ${!toColor ? "empty" : ""}`}
            style={toColor ? { backgroundColor: toColor } : undefined}
          />

          <span>To</span>
        </div>
      </div>
    </div>
  );
}

export default SwapToolPanel;
