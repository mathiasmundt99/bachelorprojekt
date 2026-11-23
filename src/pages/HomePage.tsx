import { useCallback, useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import PageHeader from "../components/home/PageHeader";
import ProjectCard from "../components/home/ProjectCard";
import CreateProjectCard from "../components/home/CreateProjectCard";
import DashboardStats from "../components/home/DashboardStats";
import ReminderCard from "../components/home/ReminderCard";
import NewProjectModal from "../components/modals/NewProjectModal";

import {
  getUserProjects,
  createProject,
  deleteProject,
} from "../services/projectService";

import type { Project } from "../types/project";

import "../styles/HomePage.css";

function HomePage() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");

  // FETCH PROJECTS
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

  // OPEN CREATE MODAL
  const handleCreate = () => {
    setSelectedProject(null);
    setIsProjectModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // UPDATE PROJECT IN STATE
  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.project_id === updatedProject.project_id
          ? updatedProject
          : project,
      ),
    );
  };

  // DUPLICATE PROJECT
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

  // DELETE PROJECT
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

  return (
    <>
      <Navbar />

      <main className="home-container">
        <PageHeader projectCount={projects.length} />

        <section className="projects-grid">
          <CreateProjectCard onClick={handleCreate} />

          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : projectError ? (
            <p role="alert">{projectError}</p>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p>You haven't created any projects yet.</p>
          )}
        </section>

        <section className="dashboard-grid">
          <DashboardStats />
          <ReminderCard />
        </section>
      </main>

      {isProjectModalOpen && (
        <NewProjectModal
          project={selectedProject ?? undefined}
          onClose={() => {
            setIsProjectModalOpen(false);
            setSelectedProject(null);
          }}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </>
  );
}

export default HomePage;
