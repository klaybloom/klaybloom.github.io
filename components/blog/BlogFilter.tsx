"use client";

import { useMemo, useState } from "react";
import type { PostSummary } from "@/lib/post-types";
import { TagFilter } from "@/components/TagFilter";
import { PostList } from "./PostList";

type BlogFilterProps = {
  posts: PostSummary[];
  tags: string[];
};

export function BlogFilter({ posts, tags }: BlogFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("全部");

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesTag = selectedTag === "全部" || post.tags.includes(selectedTag);
      const matchesQuery = !keyword || post.searchText.includes(keyword);
      return matchesTag && matchesQuery;
    });
  }, [posts, query, selectedTag]);

  return (
    <div>
      <div className="tahoe-system-card mb-10 !p-3">
        <div className="tahoe-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            aria-label="搜索文章"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索文章标题、描述、标签、分类..."
            type="search"
            value={query}
          />
        </div>
        <div className="mt-3">
          <TagFilter
            controlId="blog-tag-filter"
            label="文章标签"
            onSelect={setSelectedTag}
            options={["全部", ...tags]}
            selected={selectedTag}
          />
        </div>
      </div>
      <PostList posts={filteredPosts} />
    </div>
  );
}
