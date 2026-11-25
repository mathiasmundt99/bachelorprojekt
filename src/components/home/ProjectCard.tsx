import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Project } from "../../types/project";

interface Props {
  project: Project;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const fabricColors: Record<string, string> = {
  "Antique White": "#F5F0E6",
  White: "#FFFFFF",
  Cream: "#F5E6C8",
  Natural: "#D9C7A5",
  "Light Blue": "#D7E9F0",
  Black: "#292929",
};

function ProjectCard({ project, onEdit, onDuplicate, onDelete }: Props) {
  const navigate = useNavigate();

  const [isFlipped, setIsFlipped] = useState(false);

  const previewColor = fabricColors[project.fabric_color ?? ""] ?? "#F8D967";

  // OPEN PROJECT
  function handleOpenProject() {
    navigate(`/canvas/${project.project_id}`, {
      state: {
        projectName: project.name,
        width: project.width,
        height: project.height,
        fabricCount: project.fabric_count ?? 14,
        fabricColor: project.fabric_color ?? "Antique White",
        selectedPalette:
          project.palette_id === null ? "all" : String(project.palette_id),
      },
    });
  }

  return (
    <div className={`project-card-wrapper ${isFlipped ? "flipped" : ""}`}>
      <div className="project-card-inner">
        {/* FRONT */}
        <article className="project-card project-card-front">
          <button
            type="button"
            className="project-preview"
            style={{ backgroundColor: previewColor }}
            onClick={handleOpenProject}
            disabled={isFlipped}
            aria-label={`Open ${project.name}`}
            title={`Open ${project.name}`}>
            <div className="canvas-preview">
              <div className="stitch-symbol">✳</div>
            </div>
          </button>

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
              onClick={() => setIsFlipped(true)}>
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
              onClick={() => setIsFlipped(false)}>
              <span className="material-symbols-sharp">close</span>
            </button>
          </div>

          <div className="card-back-options">
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                onEdit(project);
              }}>
              <span className="material-symbols-sharp">edit</span>
              Edit project
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                onDuplicate(project);
              }}>
              <span className="material-symbols-sharp">content_copy</span>
              Duplicate project
            </button>

            <button
              type="button"
              className="delete-option"
              onClick={() => {
                setIsFlipped(false);
                onDelete(project);
              }}>
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
