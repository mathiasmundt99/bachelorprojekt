import { supabase } from "../lib/supabase";

export interface ProjectInput {
  name: string;
  width: number;
  height: number;
  fabric_count: number;
  fabric_color: string;
  palette_id: number | null;
}

export type UpdateProjectInput = Partial<ProjectInput>;

// Hent den indloggede bruger
async function checkAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("Du skal være logget ind.");
  }

  return user;
}

// CREATE - Opret projekt
export async function createProject(project: ProjectInput) {
  const user = await checkAuthenticatedUser();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      ...project,
    })
    .select()
    .single();

  if (error) {
    console.error("Fejl ved oprettelse af projekt:", error.message);
    throw error;
  }

  return data;
}

// READ - Hent brugerens projekter
export async function getUserProjects() {
  await checkAuthenticatedUser();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fejl ved hentning af projekter:", error.message);
    throw error;
  }

  return data;
}

// UPDATE - Rediger projekt
export async function updateProject(
  projectId: number,
  updates: UpdateProjectInput
) {
  await checkAuthenticatedUser();

  if (Object.keys(updates).length === 0) {
    throw new Error("Ingen ændringer at gemme.");
  }

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("project_id", projectId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Fejl ved opdatering af projekt:", error.message);
    throw error;
  }

  if (!data) {
    throw new Error("Projektet blev ikke fundet, eller du har ikke adgang.");
  }

  return data;
}

// DELETE - Slet projekt
export async function deleteProject(projectId: number) {
  await checkAuthenticatedUser();

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("project_id", projectId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Fejl ved sletning af projekt:", error.message);
    throw error;
  }

  if (!data) {
    throw new Error("Projektet blev ikke fundet, eller du har ikke adgang.");
  }

  return data;
}