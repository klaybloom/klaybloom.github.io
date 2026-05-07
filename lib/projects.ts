import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { formatDate } from "./date";

function sortByDateDesc(items: Project[]) {
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllProjects() {
  return sortByDateDesc([...projects]);
}

export function getFeaturedProjects() {
  return getAllProjects().filter((project) => project.featured);
}

export function getLatestProjects(limit: number) {
  return getFeaturedProjects().slice(0, limit);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug) ?? null;
}

export function getAllProjectSlugs() {
  return projects.map((project) => project.slug);
}

export function getAllStacks() {
  return Array.from(new Set(projects.flatMap((project) => project.stack))).sort(
    (a, b) => a.localeCompare(b, "zh-CN")
  );
}

export function getProjectSearchText(project: Project) {
  return [
    project.title,
    project.description,
    project.longDescription,
    project.category,
    project.status,
    project.stack.join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

export function formatProjectDate(date: string) {
  return formatDate(date);
}

export function getProjectStatusLabel(status: Project["status"]) {
  const labels: Record<Project["status"], string> = {
    planning: "Planning",
    building: "Building",
    launched: "Launched",
    paused: "Paused",
    archived: "Archived"
  };

  return labels[status];
}
