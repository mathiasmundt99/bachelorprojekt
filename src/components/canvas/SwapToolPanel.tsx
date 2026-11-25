import { getDmcCode, getTextColor } from "../../utils/colors/colorUtils";

type SwapToolPanelProps = {
  fromColor: string | null;
  toColor: string | null;
  dmcCodeByHex: ReadonlyMap<string, string>;
  onReset: () => void;
  onClose: () => void;
};

function SwapToolPanel({
  fromColor,
  toColor,
  dmcCodeByHex,
  onReset,
  onClose,
}: SwapToolPanelProps) {
  return (
    <div className="swap-tool-panel tool-popup">
      {/* HEADER */}

      <div className="tool-popup-header">
        <strong>SWAP COLORS</strong>

        <button
          type="button"
          className="tool-popup-close"
          onClick={onClose}
          aria-label="Close swap colors"
          title="Close swap colors">
          <span className="material-symbols-sharp" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      {/* DESCRIPTION */}

      <p className="swap-panel-description">
        {!fromColor
          ? "Click a stitch on the canvas to choose the color you want to replace."
          : !toColor
            ? "Choose a replacement color from the palette on the right."
            : "Colors replaced! Select another stitch or reset to start again."}
      </p>

      {/* COLOR PREVIEW */}

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
            {getDmcCode(fromColor, dmcCodeByHex)}
          </div>

          <span className="swap-color-label">FROM</span>
        </div>

        <span className="swap-arrow" aria-hidden="true">
          <span className="material-symbols-sharp">arrow_forward</span>
        </span>

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
            {getDmcCode(toColor, dmcCodeByHex)}
          </div>

          <span className="swap-color-label">TO</span>
        </div>
      </div>

      {/* RESET */}

      <button
        type="button"
        className="swap-reset-button"
        onClick={onReset}
        disabled={!fromColor && !toColor}>
        <span className="material-symbols-sharp" aria-hidden="true">
          restart_alt
        </span>
        Reset
      </button>
    </div>
  );
}

export default SwapToolPanel;
