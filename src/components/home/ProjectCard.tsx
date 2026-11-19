import { useState } from "react";
import type { Project } from "../../types/project";

interface Props {
  project: Project;
}

const fabricColors: Record<string, string> = {
  "Antique White": "#F5F0E6",
  White: "#FFFFFF",
  Cream: "#F5E6C8",
  Natural: "#D9C7A5",
  "Light Blue": "#D7E9F0",
  Black: "#292929",
};

function ProjectCard({ project }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const previewColor = fabricColors[project.fabric_color ?? ""] ?? "#F8D967";

  return (
    <div className={`project-card-wrapper ${isFlipped ? "flipped" : ""}`}>
      <div className="project-card-inner">
        {/* FRONT */}
        <article className="project-card project-card-front">
          <div
            className="project-preview"
            style={{ backgroundColor: previewColor }}
          >
            <div className="canvas-preview">
              <div className="stitch-symbol">✳</div>
            </div>
          </div>

          <div className="project-info">
            <div>
              <h3>{project.name}</h3>

              <p>
                {project.width} × {project.height} stitches ·{" "}
                {project.fabric_count ?? "—"} count
              </p>

              <p>
                {project.palette_id === null
                  ? "All thread colors"
                  : "Saved palette"}
              </p>
            </div>

            <button
              type="button"
              className="more-button"
              aria-label="Project options"
              onClick={() => setIsFlipped(true)}
            >
              <span className="material-symbols-sharp">more_horiz</span>
            </button>
          </div>
        </article>

        {/* BACK */}
        <article className="project-card project-card-back">
          <div className="card-back-header">
            <h3>{project.name}</h3>

            <button
              type="button"
              className="more-button"
              aria-label="Close options"
              onClick={() => setIsFlipped(false)}
            >
              <span className="material-symbols-sharp">close</span>
            </button>
          </div>

          <div className="card-back-options">
            <button type="button">
              <span className="material-symbols-sharp">edit</span>
              Edit project
            </button>

            <button type="button">
              <span className="material-symbols-sharp">content_copy</span>
              Duplicate project
            </button>

            <button type="button" className="delete-option">
              <span className="material-symbols-sharp">delete</span>
              Delete project
            </button>
          </div>

          <div className="card-back-footer">
            <span>PROJECT OPTIONS</span>
          </div>
        </article>
      </div>
    </div>
  );
}

export default ProjectCard;
