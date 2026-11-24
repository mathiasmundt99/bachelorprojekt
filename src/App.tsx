import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";

import HomePage from "./pages/HomePage";
import CanvasPage from "./pages/CanvasPage";
import InventoryPage from "./pages/InventoryPage";
import FinishedPage from "./pages/FinishPage";

function App() {
  useEffect(() => {
    const testForeignPalette = async () => {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: "test1@example.com",
        password: "Test1234!",
      });

      if (loginError) {
        console.error("Login-fejl:", loginError.message);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: "6bd97120-b559-4706-8329-07ca2a8cf1d4",
          name: "RLS Palette Test",
          width: 100,
          height: 80,
          fabric_count: 14,
          fabric_color: "Natural",
          palette_id: null,
        })
        .select();

      console.log("FOREIGN PALETTE TEST:", { data, error });
    };

    testForeignPalette();
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
