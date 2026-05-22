export type Post = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
  tags: string[];
  category?: string;
  cover?: string;
  published: boolean;
  featured: boolean;
  content: string;
};

export type PostSummary = Omit<Post, "content"> & {
  searchText: string;
};
