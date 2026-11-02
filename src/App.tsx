import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CanvasPage from "./pages/CanvasPage";
import InventoryPage from "./pages/InventoryPage";
import FinishedPage from "./pages/FinishedPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/canvas/:id" element={<CanvasPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/finished/:id" element={<FinishedPage />} />
    </Routes>
  );
}

export default App;
