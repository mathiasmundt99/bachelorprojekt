import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";

import HomePage from "./pages/HomePage";
import CanvasPage from "./pages/CanvasPage";
import InventoryPage from "./pages/InventoryPage";
import FinishedPage from "./pages/FinishedPage";

function App() {
  useEffect(() => {
    const testDMCInsert = async () => {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: "test1@example.com",
        password: "Test1234!",
      });

      if (loginError) {
        console.error("Login-fejl:", loginError.message);
        return;
      }

      const { data, error } = await supabase
        .from("palette_colors")
        .update({ palette_id: 2 })
        .eq("palette_id", 1)
        .eq("dmc_code", "3713")
        .select();

      console.log("UPDATE palette_colors:", { data, error });
    };

    testDMCInsert();
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
