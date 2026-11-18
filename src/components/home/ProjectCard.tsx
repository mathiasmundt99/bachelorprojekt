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
  const previewColor = fabricColors[project.fabric_color ?? ""] ?? "#F8D967";

  return (
    <article className="project-card">
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
        >
          <span className="material-symbols-sharp">more_horiz</span>
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
