import { useCallback, useEffect, useRef, useState } from "react";
import type { Pattern } from "../types/pattern";

const MAX_HISTORY = 50;

type HistoryState = {
  past: Pattern[];
  present: Pattern;
  future: Pattern[];
};

function patternsEqual(a: Pattern, b: Pattern): boolean {
  if (a === b) return true;

  if (a.width !== b.width || a.height !== b.height) {
    return false;
  }

  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      if (a.stitches[y][x] !== b.stitches[y][x]) {
        return false;
      }
    }
  }

  return true;
}

export function usePatternHistory(initialPattern: Pattern) {
  const [history, setHistory] = useState<HistoryState>(() => ({
    past: [],
    present: initialPattern,
    future: [],
  }));

  // Bruges til at samle et helt penselstrøg i ét historikpunkt
  const strokeStartRef = useRef<Pattern | null>(null);

  // ========================================
  // UPDATE PATTERN
  // ========================================

  const setPattern = useCallback(
    (update: Pattern | ((current: Pattern) => Pattern)) => {
      setHistory((current) => {
        const nextPattern =
          typeof update === "function" ? update(current.present) : update;

        if (patternsEqual(current.present, nextPattern)) {
          return current;
        }

        // Under et penselstrøg opdaterer vi kun tegningen
        if (strokeStartRef.current !== null) {
          return {
            ...current,
            present: nextPattern,
          };
        }

        // Andre ændringer gemmes som separate historikpunkter
        return {
          past: [...current.past, current.present].slice(-MAX_HISTORY),
          present: nextPattern,
          future: [],
        };
      });
    },
    [],
  );

  // ========================================
  // BEGIN STROKE
  // ========================================

  const beginStroke = useCallback(() => {
    strokeStartRef.current = null;

    setHistory((current) => {
      strokeStartRef.current = current.present;
      return current;
    });
  }, []);

  // ========================================
  // END STROKE
  // ========================================

  const endStroke = useCallback(() => {
    const strokeStart = strokeStartRef.current;

    if (strokeStart === null) return;

    setHistory((current) => {
      if (patternsEqual(strokeStart, current.present)) {
        return current;
      }

      return {
        past: [...current.past, strokeStart].slice(-MAX_HISTORY),
        present: current.present,
        future: [],
      };
    });

    strokeStartRef.current = null;
  }, []);

  // ========================================
  // UNDO
  // ========================================

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];

      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  // ========================================
  // REDO
  // ========================================

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];

      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  // ========================================
  // KEYBOARD SHORTCUTS
  // ========================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();

      if (key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (key === "y") {
        event.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  return {
    pattern: history.present,
    setPattern,
    beginStroke,
    endStroke,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
