import type { Project } from "./types";
import projectsData from "./projects.json";

export type { ProjectStatus } from "./types";

export const projects: Project[] = projectsData.projects as Project[];
