import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import PageHeader from "../components/home/PageHeader";
import ProjectCard from "../components/home/ProjectCard";
import CreateProjectCard from "../components/home/CreateProjectCard";
import DashboardStats from "../components/home/DashboardStats";
import ReminderCard from "../components/home/ReminderCard";
import NewProjectModal from "../components/modals/NewProjectModal";

import { getUserProjects } from "../services/projectService";
import type { Project } from "../types/project";

import "../styles/HomePage.css";

function HomePage() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");

  // FETCH PROJECTS FROM SUPABASE
  useEffect(() => {
    const loadProjects = async () => {
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
    };

    loadProjects();
  }, []);

  return (
    <>
      <Navbar />

      <main className="home-container">
        <PageHeader projectCount={projects.length} />

        <section className="projects-grid">
          <CreateProjectCard onClick={() => setIsNewProjectOpen(true)} />

          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : projectError ? (
            <p role="alert">{projectError}</p>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.project_id} project={project} />
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

      {isNewProjectOpen && (
        <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />
      )}
    </>
  );
}

export default HomePage;
