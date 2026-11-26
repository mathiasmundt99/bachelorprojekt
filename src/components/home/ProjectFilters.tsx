import { useRef } from "react";

import type { ProjectSortOrder } from "../../hooks/useProjectFilters";

// ========================================
// TYPES
// ========================================

type ProjectFiltersProps = {
  searchQuery: string;
  sortOrder: ProjectSortOrder;

  totalCount: number;
  filteredCount: number;

  disabled?: boolean;

  onSearchChange: (query: string) => void;
  onSortChange: (sortOrder: ProjectSortOrder) => void;
  onClearSearch: () => void;
};

// ========================================
// SORT OPTIONS
// ========================================

const sortOptions: {
  value: ProjectSortOrder;
  label: string;
}[] = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "name-asc",
    label: "Name A–Z",
  },
  {
    value: "name-desc",
    label: "Name Z–A",
  },
];

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

function ProjectFilters({
  searchQuery,
  sortOrder,
  totalCount,
  filteredCount,
  disabled = false,
  onSearchChange,
  onSortChange,
  onClearSearch,
}: ProjectFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleClearSearch() {
    onClearSearch();
    searchInputRef.current?.focus();
  }

  return (
    <section className="project-filters" aria-label="Search and sort projects">
      <div className="project-filter-controls">
        {/* SEARCH */}

        <div className="project-search">
          <MaterialIcon name="search" />

          <input
            ref={searchInputRef}
            className="project-search-input"
            type="text"
            placeholder="Search projects..."
            aria-label="Search projects"
            value={searchQuery}
            disabled={disabled}
            autoComplete="off"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                handleClearSearch();
              }
            }}
          />

          {searchQuery && (
            <button
              type="button"
              className="project-search-clear"
              title="Clear search"
              aria-label="Clear search"
              disabled={disabled}
              onClick={handleClearSearch}>
              <MaterialIcon name="close" />
            </button>
          )}
        </div>

        {/* SORT */}

        <div className="project-sort">
          <MaterialIcon name="sort" />

          <select
            className="project-sort-select"
            aria-label="Sort projects"
            value={sortOrder}
            disabled={disabled}
            onChange={(event) =>
              onSortChange(event.target.value as ProjectSortOrder)
            }>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="project-sort-arrow">
            <MaterialIcon name="keyboard_arrow_down" />
          </span>
        </div>
      </div>

      {/* SEARCH RESULTS */}

      {!disabled && searchQuery.trim() && (
        <p className="project-filter-count" role="status">
          Showing {filteredCount} of {totalCount} projects
        </p>
      )}
    </section>
  );
}

export default ProjectFilters;
