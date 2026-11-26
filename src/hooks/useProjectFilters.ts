import { useMemo, useState } from "react";

import type { Project } from "../types/project";

// ========================================
// TYPES
// ========================================

export type ProjectSortOrder = "newest" | "oldest" | "name-asc" | "name-desc";

// ========================================
// PROJECT FILTERS HOOK
// ========================================

export function useProjectFilters(projects: Project[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("newest");

  // ========================================
  // FILTER AND SORT PROJECTS
  // ========================================

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matchingProjects = projects.filter((project) =>
      project.name.toLowerCase().includes(query),
    );

    return matchingProjects.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

        case "name-asc":
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
            numeric: true,
          });

        case "name-desc":
          return b.name.localeCompare(a.name, undefined, {
            sensitivity: "base",
            numeric: true,
          });

        default:
          return 0;
      }
    });
  }, [projects, searchQuery, sortOrder]);

  // ========================================
  // CLEAR SEARCH
  // ========================================

  function clearSearch() {
    setSearchQuery("");
  }

  // ========================================
  // RETURN
  // ========================================

  return {
    searchQuery,
    setSearchQuery,

    sortOrder,
    setSortOrder,

    filteredProjects,

    clearSearch,

    isSearching: searchQuery.trim().length > 0,

    totalCount: projects.length,
    filteredCount: filteredProjects.length,
  };
}
