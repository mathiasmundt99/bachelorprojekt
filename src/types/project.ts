export interface Project {
  project_id: number;
  user_id: string;
  name: string;
  width: number;
  height: number;
  fabric_count: number | null;
  fabric_color: string | null;
  palette_id: number | null;
  created_at: string;
}