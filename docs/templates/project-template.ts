import type { Project } from "@/content/types";

export const projectTemplate: Project = {
  title: "TODO: Project title",
  slug: "todo-project-slug",
  description: "TODO: Short project summary for cards and list pages.",
  longDescription:
    "TODO: Longer explanation of the project's purpose, scope, and implementation.",
  disclosure: "public",
  caseStudy: {
    role: "TODO: Your role",
    responsibilities: ["TODO: One responsibility per item"],
    highlights: ["TODO: One implementation highlight per item"],
    outcomes: ["TODO: One verified outcome per item"],
  },
  stack: ["TODO: Tech"],
  category: "TODO: Category",
  cover: "/images/projects/TODO-project-cover.png",
  github: "https://github.com/klaybloom/TODO-repo",
  demo: "https://TODO-demo-url.example",
  date: "YYYY-MM-DD",
  updated: "YYYY-MM-DD",
  status: "planning",
  featured: false,
  pinned: false
};
