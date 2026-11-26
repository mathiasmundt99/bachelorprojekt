import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";

import HomePage from "./pages/HomePage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import InventoryPage from "./pages/InventoryPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        // Tjek om brugeren allerede har en aktiv session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // Brug eksisterende session
        if (session) {
          setIsAuthenticated(true);
          return;
        }

        // Login med testbruger
        const { error } = await supabase.auth.signInWithPassword({
          email: "test1@example.com",
          password: "Test1234!",
        });

        if (error) throw error;

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);

        setAuthError(
          error instanceof Error
            ? error.message
            : "Could not authenticate user.",
        );
      }
    };

    authenticateUser();
  }, []);

  if (authError) {
    return <p>Login error: {authError}</p>;
  }

  if (!isAuthenticated) {
    return <p>Authenticating...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/:page/:id" element={<ProjectWorkspace />} />
    </Routes>
  );
}

export default App;
