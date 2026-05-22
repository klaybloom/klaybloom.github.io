"use client";

import { useMemo, useState } from "react";
import type { PostSummary } from "@/lib/post-types";
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
      <div className="mb-8 rounded-[22px] border border-notion-line bg-white/72 p-3">
        <input
          aria-label="搜索文章"
          className="h-11 w-full rounded-[16px] border border-notion-line bg-white px-4 text-[14px] text-notion-text outline-none transition placeholder:text-notion-faint focus:border-notion-accent"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索文章标题、描述、标签、分类..."
          type="search"
          value={query}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["全部", ...tags].map((tag) => {
            const isActive = selectedTag === tag;

            return (
              <button
                className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                  isActive
                    ? "border-notion-accent bg-notion-accent text-white"
                    : "border-notion-line bg-white text-notion-muted hover:bg-notion-hover hover:text-notion-text"
                }`}
                key={tag}
                onClick={() => setSelectedTag(tag)}
                type="button"
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
      <PostList posts={filteredPosts} />
    </div>
  );
}
