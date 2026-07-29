import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { formatDate } from "./date";
import type { Post, PostSummary } from "./post-types";

export type { Post, PostSummary };

export const DEFAULT_COVER = "/images/default-cover.jpg";

const postsDirectory = path.join(process.cwd(), "content/posts");


type FrontMatter = {
  title?: unknown;
  date?: unknown;
  updated?: unknown;
  description?: unknown;
  tags?: unknown;
  category?: unknown;
  cover?: unknown;
  published?: unknown;
  featured?: unknown;
};

function getMarkdownFiles() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function readPostFile(fileName: string): Post | null {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontMatter = data as FrontMatter;
  const slug = fileName.replace(/\.md$/, "");
  let title = String(frontMatter.title ?? "").trim();
  if (!title) {
    title = slug;
  }

  let date = String(frontMatter.date ?? "").trim();
  if (!date) {
    // Try to extract date from filename prefix YYYY-MM-DD
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      date = dateMatch[1];
    } else {
      // Fallback to file modification time or today's date
      try {
        const stats = fs.statSync(fullPath);
        date = stats.mtime.toISOString().split("T")[0];
      } catch {
        date = new Date().toISOString().split("T")[0];
      }
    }
  }

  const published = frontMatter.published !== false;

  if (!published) {
    return null;
  }

  return {
    slug,
    title,
    date,
    updated: frontMatter.updated ? String(frontMatter.updated) : undefined,
    description: String(frontMatter.description ?? "").trim(),
    tags: Array.isArray(frontMatter.tags) ? frontMatter.tags.map(String) : [],
    category: frontMatter.category ? String(frontMatter.category) : undefined,
    cover: getCover(frontMatter.cover, content),
    published,
    featured: frontMatter.featured === true,
    content
  };
}

function getCover(cover: unknown, content: string) {
  if (typeof cover === "string" && cover.trim()) {
    return cover.trim();
  }

  return extractFirstImage(content) ?? DEFAULT_COVER;
}

function extractFirstImage(content: string) {
  const match = content.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match?.[1];
}

export function createPostSummary(post: Post): PostSummary {
  const searchText = [
    post.title,
    post.description,
    post.tags.join(" "),
    post.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    updated: post.updated,
    description: post.description,
    tags: post.tags,
    category: post.category,
    cover: post.cover,
    published: post.published,
    featured: post.featured,
    searchText
  };
}

function sortByDateDesc<T extends { date: string }>(posts: T[]) {
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPublishedPosts(): PostSummary[] {
  const posts = getMarkdownFiles()
    .map(readPostFile)
    .filter((post): post is Post => Boolean(post))
    .map(createPostSummary);

  return sortByDateDesc(posts);
}

export function getAllPosts() {
  return getPublishedPosts();
}

export function getLatestPosts(limit: number) {
  const posts = getPublishedPosts();
  const featured = posts.filter((post) => post.featured);
  const latest = posts.filter((post) => !post.featured);
  return [...featured, ...latest].slice(0, limit);
}

export function getPostBySlug(slug: string): Post | null {
  const fileName = `${slug}.md`;

  if (!getMarkdownFiles().includes(fileName)) {
    return null;
  }

  return readPostFile(fileName);
}

export function getAllPostSlugs() {
  return getPublishedPosts().map((post) => post.slug);
}

export function getAllTags() {
  const tagUsage = new Map<string, number>();

  for (const post of getPublishedPosts()) {
    for (const tag of new Set(post.tags)) {
      tagUsage.set(tag, (tagUsage.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagUsage.keys()).sort(
    (a, b) =>
      (tagUsage.get(b) ?? 0) - (tagUsage.get(a) ?? 0) ||
      a.localeCompare(b, "zh-CN")
  );
}

export function formatPostDate(date: string) {
  return formatDate(date);
}
