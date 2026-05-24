import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";
import { getAllProjects } from "@/lib/projects";
import { getPublishedPosts } from "@/lib/posts";

const siteUrl = siteConfig.url.replace(/\/$/, "");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const postRoutes = getPublishedPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const projectRoutes = getAllProjects().map((project) => ({
    url: `${siteUrl}/projects/${project.slug}/`,
    lastModified: new Date(project.updated ?? project.date),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.6 : 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
