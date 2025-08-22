export interface Group {
  id: string;
  name: string;
  description: string;
  type: "country" | "theme";
  image_url?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroup {
  name: string;
  description: string;
  type: "country" | "theme";
  image_url?: string;
  creator_id: string;
}
