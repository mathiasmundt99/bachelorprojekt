import { useState } from "react";

import {
  DEFAULT_CANVAS_SETTINGS,
  type CanvasSettings,
} from "../types/canvasSettings";

export function useCanvasSettings() {
  const [settings, setSettings] = useState<CanvasSettings>({
    ...DEFAULT_CANVAS_SETTINGS,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  function updateSettings(updates: Partial<CanvasSettings>) {
    setSettings((current) => ({
      ...current,
      ...updates,
    }));
  }

  function toggleSettings() {
    if (settingsOpen) {
      closeSettings();
    } else {
      setSettingsOpen(true);
    }
  }

  function closeSettings() {
    setSettingsOpen(false);
    setIsResizing(false);
  }

  function toggleResize() {
    setIsResizing((current) => !current);
  }

  return {
    settings,
    settingsOpen,
    isResizing,
    updateSettings,
    toggleSettings,
    closeSettings,
    toggleResize,
  };
}
