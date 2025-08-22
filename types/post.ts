export interface Post {
  id: string;
  content: string;
  images?: string[];
  author_id: string;
  group_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    genotype: string;
    country: string;
  };
  group?: {
    id: string;
    name: string;
    type: string;
  };
  post_likes?: { user_id: string }[];
  comments?: { count: number }[];
  post_tags?: {
    tagged_user: {
      id: string;
      first_name: string;
      last_name: string;
    };
  }[];
}

export interface CreatePost {
  content: string;
  images?: string[];
  author_id: string;
  group_id?: string;
}

export interface UpdatePost {
  content?: string;
  images?: string[];
}
