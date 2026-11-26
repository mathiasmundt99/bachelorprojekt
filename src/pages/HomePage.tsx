import { useCallback, useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import PageHeader from "../components/home/PageHeader";
import ProjectCard from "../components/home/ProjectCard";
import CreateProjectCard from "../components/home/CreateProjectCard";
import DashboardStats from "../components/home/DashboardStats";
import ReminderCard from "../components/home/ReminderCard";
import ProjectFilters from "../components/home/ProjectFilters";
import NewProjectModal from "../components/modals/NewProjectModal";

import { useProjectFilters } from "../hooks/useProjectFilters";

import {
  getUserProjects,
  createProject,
  deleteProject,
} from "../services/projectService";

import type { Project } from "../types/project";

import "../styles/HomePage.css";

// ========================================
// HOME PAGE
// ========================================

function HomePage() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(true);

  const [projectError, setProjectError] = useState("");

  // ========================================
  // PROJECT FILTERS
  // ========================================

  const {
    searchQuery,
    setSearchQuery,

    sortOrder,
    setSortOrder,

    filteredProjects,

    clearSearch,

    isSearching,

    totalCount,
    filteredCount,
  } = useProjectFilters(projects);

  // ========================================
  // FETCH PROJECTS
  // ========================================

  const loadProjects = useCallback(async () => {
    try {
      setProjectError("");

      const data = await getUserProjects();

      setProjects(data as Project[]);
    } catch (error) {
      console.error("Error loading projects:", error);

      setProjectError("Could not load your projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ========================================
  // OPEN CREATE MODAL
  // ========================================

  const handleCreate = () => {
    setSelectedProject(null);
    setIsProjectModalOpen(true);
  };

  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // ========================================
  // CLOSE PROJECT MODAL
  // ========================================

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);

    void loadProjects();
  };

  // ========================================
  // UPDATE PROJECT IN STATE
  // ========================================

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((currentProjects) => {
      const projectExists = currentProjects.some(
        (project) => project.project_id === updatedProject.project_id,
      );

      if (!projectExists) {
        return [updatedProject, ...currentProjects];
      }

      return currentProjects.map((project) =>
        project.project_id === updatedProject.project_id
          ? updatedProject
          : project,
      );
    });
  };

  // ========================================
  // DUPLICATE PROJECT
  // ========================================

  const handleDuplicate = async (project: Project) => {
    try {
      setProjectError("");

      await createProject({
        name: `${project.name} (Copy)`,
        width: project.width,
        height: project.height,
        fabric_count: project.fabric_count ?? 14,
        fabric_color: project.fabric_color ?? "Antique White",
        palette_id: project.palette_id,
      });

      await loadProjects();
    } catch (error) {
      console.error("Error duplicating project:", error);

      setProjectError("Could not duplicate project.");
    }
  };

  // ========================================
  // DELETE PROJECT
  // ========================================

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) return;

    try {
      setProjectError("");

      await deleteProject(project.project_id);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (item) => item.project_id !== project.project_id,
        ),
      );
    } catch (error) {
      console.error("Error deleting project:", error);

      setProjectError("Could not delete project.");
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      <Navbar />

      <main className="home-container">
        {/* PAGE HEADER */}

        <PageHeader projectCount={totalCount} />

        {/* SEARCH AND SORT */}

        <ProjectFilters
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          totalCount={totalCount}
          filteredCount={filteredCount}
          disabled={loadingProjects}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOrder}
          onClearSearch={clearSearch}
        />

        {/* PROJECT ERROR */}

        {projectError && (
          <div className="project-list-error" role="alert">
            <span className="material-symbols-sharp" aria-hidden="true">
              error
            </span>

            <span>{projectError}</span>

            <button
              type="button"
              className="project-error-retry"
              onClick={() => {
                setLoadingProjects(true);
                void loadProjects();
              }}>
              <span className="material-symbols-sharp" aria-hidden="true">
                refresh
              </span>
              Retry
            </button>
          </div>
        )}

        {/* PROJECT GRID */}

        <section className="projects-grid" aria-busy={loadingProjects}>
          {/* CREATE PROJECT */}

          <CreateProjectCard onClick={handleCreate} />

          {/* LOADING STATE */}

          {loadingProjects ? (
            <div className="project-list-state" role="status">
              <span
                className="material-symbols-sharp project-loading-icon"
                aria-hidden="true">
                progress_activity
              </span>

              <strong>Loading projects...</strong>
            </div>
          ) : filteredProjects.length > 0 ? (
            /* PROJECT CARDS */

            filteredProjects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))
          ) : projectError ? null : isSearching ? (
            /* NO SEARCH RESULTS */

            <div className="project-list-state">
              <span className="material-symbols-sharp" aria-hidden="true">
                search_off
              </span>

              <strong>No matching projects</strong>

              <p>No projects match "{searchQuery.trim()}".</p>

              <button
                type="button"
                className="project-clear-filters"
                onClick={clearSearch}>
                <span className="material-symbols-sharp" aria-hidden="true">
                  close
                </span>
                Clear search
              </button>
            </div>
          ) : (
            /* EMPTY PROJECT LIST */

            <div className="project-list-state">
              <span className="material-symbols-sharp" aria-hidden="true">
                folder_open
              </span>

              <strong>No projects yet</strong>

              <p>Create your first cross-stitch project to get started.</p>
            </div>
          )}
        </section>

        {/* DASHBOARD */}

        <section className="dashboard-grid">
          <DashboardStats />
          <ReminderCard />
        </section>
      </main>

      {/* PROJECT MODAL */}

      {isProjectModalOpen && (
        <NewProjectModal
          project={selectedProject ?? undefined}
          onClose={handleCloseProjectModal}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </>
  );
}

export default HomePage;
