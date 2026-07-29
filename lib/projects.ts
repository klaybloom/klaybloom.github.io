import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { formatDate } from "./date";

function sortByDateDesc(items: Project[]) {
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function sortHomepageProjects(items: Project[]) {
  return items.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      new Date(b.updated).getTime() - new Date(a.updated).getTime() ||
      new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getAllProjects() {
  return sortByDateDesc([...projects]);
}

export function getFeaturedProjects() {
  return sortHomepageProjects(
    projects.filter((project) => project.featured),
  );
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
  const stackUsage = new Map<string, number>();

  for (const project of projects) {
    for (const stack of new Set(project.stack)) {
      stackUsage.set(stack, (stackUsage.get(stack) ?? 0) + 1);
    }
  }

  return Array.from(stackUsage.keys()).sort(
    (a, b) =>
      (stackUsage.get(b) ?? 0) - (stackUsage.get(a) ?? 0) ||
      a.localeCompare(b, "zh-CN")
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
