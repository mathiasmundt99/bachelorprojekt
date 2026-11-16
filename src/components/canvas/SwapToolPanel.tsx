import dmcColors from "../../data/dmc-colors.json";
import "../../styles/modals/SwapToolPanel.css";

type SwapToolPanelProps = {
  fromColor: string | null;
  toColor: string | null;
  onReset: () => void;
};

function getDmcCode(hex: string | null): string {
  if (!hex) return "";

  const color = dmcColors.find(
    (item) => item.hex.toLowerCase() === hex.toLowerCase(),
  );

  return color?.code ?? "";
}

function getTextColor(hex: string): string {
  const normalized = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#000000";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 150 ? "#ffffff" : "#000000";
}

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
          : !toColor
            ? "Choose a replacement color from the palette on the right."
            : "Colors replaced! Select another stitch or reset to start again."}
      </p>

      <div className="swap-color-row">
        <div className="swap-color-item">
          <div
            className={`swap-color-box ${!fromColor ? "empty" : ""}`}
            style={
              fromColor
                ? {
                    backgroundColor: fromColor,
                    color: getTextColor(fromColor),
                  }
                : undefined
            }>
            {getDmcCode(fromColor)}
          </div>

          <span className="swap-color-label">From</span>
        </div>

        <span className="swap-arrow">→</span>

        <div className="swap-color-item">
          <div
            className={`swap-color-box ${!toColor ? "empty" : ""}`}
            style={
              toColor
                ? {
                    backgroundColor: toColor,
                    color: getTextColor(toColor),
                  }
                : undefined
            }>
            {getDmcCode(toColor)}
          </div>

          <span className="swap-color-label">To</span>
        </div>
      </div>
    </div>
  );
}

export default SwapToolPanel;
