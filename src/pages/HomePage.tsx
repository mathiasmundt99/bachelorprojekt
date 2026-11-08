import Navbar from "../components/layout/Navbar";
import PageHeader from "../components/home/PageHeader";
import ProjectCard from "../components/home/ProjectCard";
import CreateProjectCard from "../components/home/CreateProjectCard";
import DashboardStats from "../components/home/DashboardStats";
import ReminderCard from "../components/home/ReminderCard";

import { projects } from "../data/projects";

import "../styles/HomePage.css";

function HomePage() {
  return (
    <>
      <Navbar />

      <main className="home-container">
        <PageHeader projectCount={projects.length} />

        <section className="projects-grid">
          <CreateProjectCard />

          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>

        <section className="dashboard-grid">
          <DashboardStats />
          <ReminderCard />
        </section>
      </main>
    </>
  );
}

export default HomePage;
