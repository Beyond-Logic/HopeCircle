export interface Group {
  id: string;
  name: string;
  description: string;
  type: "country" | "theme";
  image_url?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  member_count: number;
}

export interface CreateGroup {
  name: string;
  description: string;
  type: "country" | "theme";
  image_url?: string;
  creator_id: string;
}
