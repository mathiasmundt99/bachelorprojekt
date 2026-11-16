import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/layout/Navbar";
import AddToStashModal from "../components/modals/AddToStashModal";

import dmcColors from "../data/dmc-colors.json";

import "../styles/InventoryPage.css";

type StashItem = {
  code: string;
  quantity: number;
  runningLow: boolean;
};

type StashFilter = "stash" | "low";
type SortOption = "number" | "hue";

const STORAGE_KEY = "cross-stitch-stash";

function loadStash(): StashItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    const validCodes = new Set(dmcColors.map((color) => color.code));

    const seen = new Set<string>();

    return parsed.filter((item): item is StashItem => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.code !== "string" ||
        !validCodes.has(item.code) ||
        seen.has(item.code) ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 0 ||
        typeof item.runningLow !== "boolean"
      ) {
        return false;
      }

      seen.add(item.code);
      return true;
    });
  } catch {
    return [];
  }
}

function getHue(hex: string): number {
  const value = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return 0;
  }

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;

  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  return (hue * 60 + 360) % 360;
}

function InventoryPage() {
  const [stash, setStash] = useState<StashItem[]>(loadStash);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StashFilter>("stash");
  const [sort, setSort] = useState<SortOption>("number");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ========================================
  // SAVE TO LOCAL STORAGE
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stash));
    } catch {
      // Inventory kan stadig bruges, hvis browseren
      // ikke tillader lokal lagring.
    }
  }, [stash]);

  // ========================================
  // INVENTORY STATISTICS
  // ========================================

  const totalColors = stash.length;

  const totalSkeins = stash.reduce((total, item) => total + item.quantity, 0);

  const lowStockCount = stash.filter((item) => item.runningLow).length;

  // ========================================
  // DISPLAYED COLORS
  // ========================================

  const displayedColors = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return stash
      .map((item) => {
        const color = dmcColors.find((dmc) => dmc.code === item.code);

        return color ? { ...item, ...color } : null;
      })
      .filter((item) => item !== null)
      .filter((item) => {
        if (filter === "low" && !item.runningLow) {
          return false;
        }

        if (!searchTerm) return true;

        return (
          item.code.toLowerCase().includes(searchTerm) ||
          item.name.toLowerCase().includes(searchTerm)
        );
      })
      .sort((a, b) => {
        if (sort === "hue") {
          const hueDifference = getHue(a.hex) - getHue(b.hex);

          if (hueDifference !== 0) {
            return hueDifference;
          }
        }

        return a.code.localeCompare(b.code, undefined, { numeric: true });
      });
  }, [stash, search, filter, sort]);

  // ========================================
  // CHANGE QUANTITY
  // ========================================

  function changeQuantity(code: string, amount: number) {
    setStash((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + amount),
            }
          : item,
      ),
    );
  }

  // ========================================
  // TOGGLE RUNNING LOW
  // ========================================

  function toggleRunningLow(code: string) {
    setStash((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              runningLow: !item.runningLow,
            }
          : item,
      ),
    );
  }

  // ========================================
  // ADD NEW COLORS
  // ========================================

  function addColors(codes: string[]) {
    const validCodes = new Set(dmcColors.map((color) => color.code));

    setStash((current) => {
      const existingCodes = new Set(current.map((item) => item.code));

      const newItems: StashItem[] = [];

      for (const code of codes) {
        if (!validCodes.has(code) || existingCodes.has(code)) {
          continue;
        }

        existingCodes.add(code);

        newItems.push({
          code,
          quantity: 1,
          runningLow: false,
        });
      }

      return [...current, ...newItems];
    });

    setIsAddModalOpen(false);
  }

  // ========================================
  // REMOVE FROM STASH
  // ========================================

  function removeFromStash(code: string) {
    setStash((current) => current.filter((item) => item.code !== code));
  }

  return (
    <>
      <Navbar />

      <main className="inventory-page">
        {/* PAGE HEADER */}
        <header className="inventory-header">
          <div>
            <p className="inventory-eyebrow">
              {totalColors} COLORS · {totalSkeins} SKEINS
            </p>

            <h1>DMC collection</h1>
          </div>

          <button
            type="button"
            className="inventory-add-button"
            onClick={() => setIsAddModalOpen(true)}>
            <span aria-hidden="true">+</span>
            Add to stash
          </button>
        </header>

        {/* FILTER BAR */}
        <section className="inventory-filter-bar">
          <div className="inventory-search-wrapper">
            <span className="inventory-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a DMC color"
              aria-label="Search DMC colors in stash"
            />
          </div>

          <div className="inventory-filter-actions">
            <button
              type="button"
              className={`inventory-filter-button ${
                filter === "stash" ? "active" : ""
              }`}
              onClick={() => setFilter("stash")}>
              In stash
            </button>

            <button
              type="button"
              className={`inventory-filter-button ${
                filter === "low" ? "active" : ""
              }`}
              onClick={() => setFilter("low")}>
              Running low
              {lowStockCount > 0 && (
                <span className="inventory-low-count">{lowStockCount}</span>
              )}
            </button>

            <div className="inventory-sort-wrapper">
              <label htmlFor="inventory-sort">Sort</label>

              <select
                id="inventory-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}>
                <option value="number">DMC number</option>
                <option value="hue">Color hue</option>
              </select>
            </div>
          </div>
        </section>

        {/* COLOR CARDS */}
        {displayedColors.length > 0 ? (
          <section
            className="inventory-grid"
            aria-label="Your DMC thread collection">
            {displayedColors.map((color) => (
              <article
                key={color.code}
                className={`inventory-card ${
                  color.runningLow ? "inventory-card-low" : ""
                }`}>
                <div
                  className="inventory-color-preview"
                  style={{
                    backgroundColor: color.hex,
                  }}
                  aria-label={`${color.name} color preview`}
                  role="img"
                />

                <div className="inventory-card-info">
                  <strong>DMC {color.code}</strong>
                  <span title={color.name}>{color.name}</span>
                </div>

                <div className="inventory-card-controls">
                  <div
                    className="inventory-quantity"
                    aria-label={`Quantity of DMC ${color.code}`}>
                    <button
                      type="button"
                      onClick={() => changeQuantity(color.code, -1)}
                      disabled={color.quantity === 0}
                      aria-label={`Remove one skein of DMC ${color.code}`}>
                      −
                    </button>

                    <span>{color.quantity}</span>

                    <button
                      type="button"
                      onClick={() => changeQuantity(color.code, 1)}
                      aria-label={`Add one skein of DMC ${color.code}`}>
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`inventory-low-button ${
                      color.runningLow ? "active" : ""
                    }`}
                    onClick={() => toggleRunningLow(color.code)}
                    aria-pressed={color.runningLow}
                    title={
                      color.runningLow
                        ? "Remove running low mark"
                        : "Mark as running low"
                    }>
                    {color.runningLow ? "Low stock ✓" : "Mark low"}
                  </button>

                  <button
                    type="button"
                    className="inventory-remove-button"
                    onClick={() => removeFromStash(color.code)}
                    title={`Remove DMC ${color.code} from stash`}
                    aria-label={`Remove DMC ${color.code} from stash`}>
                    ×
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="inventory-empty">
            <h2>
              {stash.length === 0
                ? "Your stash is empty"
                : filter === "low"
                  ? "No running low colors found"
                  : "No matching colors"}
            </h2>

            <p>
              {stash.length === 0
                ? "Start building your DMC collection by adding your first threads."
                : filter === "low"
                  ? "Mark colors as running low to see them here."
                  : "Try searching for another DMC number or name."}
            </p>

            {stash.length === 0 && (
              <button
                type="button"
                className="inventory-empty-add"
                onClick={() => setIsAddModalOpen(true)}>
                + Add your first threads
              </button>
            )}
          </div>
        )}
      </main>

      {/* ADD TO STASH MODAL */}
      {isAddModalOpen && (
        <AddToStashModal
          existingColorCodes={stash.map((item) => item.code)}
          onAdd={addColors}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </>
  );
}

export default InventoryPage;
