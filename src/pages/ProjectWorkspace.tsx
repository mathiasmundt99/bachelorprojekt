import { useMatch } from "react-router-dom";

import CanvasPage from "./CanvasPage";
import FinishPage from "./FinishPage";

// ========================================
// PROJECT WORKSPACE
// ========================================

function ProjectWorkspace() {
  const canvasMatch = useMatch("/canvas/:id");
  const finishMatch = useMatch("/finished/:id");

  const projectId = canvasMatch?.params.id ?? finishMatch?.params.id;

  const isFinished = finishMatch !== null;

  // ========================================
  // INVALID ROUTE
  // ========================================

  if (!canvasMatch && !finishMatch) {
    return <p>Page not found.</p>;
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div key={projectId}>
      <div hidden={isFinished}>
        <CanvasPage isActive={!isFinished} />
      </div>

      {isFinished && <FinishPage />}
    </div>
  );
}

export default ProjectWorkspace;
