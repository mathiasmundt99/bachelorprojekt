import type { Project } from "../../types/project";

interface Props {
  project: Project;
}

function ProjectCard({ project }: Props) {
  return (
    <article className="project-card">
      <div
        className="project-preview"
        style={{ backgroundColor: project.color }}
      >
        <div className="canvas-preview">
          <div className="stitch-symbol">✳</div>
        </div>

        <span className="progress-label">{project.progress}%</span>
      </div>

      <div className="project-info">
        <div>
          <h3>{project.name}</h3>
          <p>
            {project.width} × {project.height} · {project.colors} colors
          </p>
        </div>

        <button className="more-button">
          <span className="material-symbols-sharp">more_horiz</span>
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
