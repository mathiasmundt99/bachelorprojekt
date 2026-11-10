import { useState } from "react";

import Navbar from "../components/layout/Navbar";
import PageHeader from "../components/home/PageHeader";
import ProjectCard from "../components/home/ProjectCard";
import CreateProjectCard from "../components/home/CreateProjectCard";
import DashboardStats from "../components/home/DashboardStats";
import ReminderCard from "../components/home/ReminderCard";
import NewProjectModal from "../components/modals/NewProjectModal";

import { projects } from "../data/projects";

import "../styles/HomePage.css";

function HomePage() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  return (
    <>
      <Navbar />

      <main className="home-container">
        <PageHeader projectCount={projects.length} />

        <section className="projects-grid">
          <CreateProjectCard onClick={() => setIsNewProjectOpen(true)} />

          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
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
