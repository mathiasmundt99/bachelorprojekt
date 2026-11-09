import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";

import HomePage from "./pages/HomePage";
import CanvasPage from "./pages/CanvasPage";
import InventoryPage from "./pages/InventoryPage";
import FinishedPage from "./pages/FinishedPage";

function App() {
  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase.from("dmc_colors").select("*").limit(1);

      if (error) {
        console.error("Supabase fejl:", error.message);
      } else {
        console.log("Supabase forbindelse virker!");
      }
    }

    testConnection();
  }, []);

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
