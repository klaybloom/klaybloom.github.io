import type { Project } from "@/content/types";
import { ProjectCard } from "./ProjectCard";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="border-y border-notion-line py-10 text-center text-[15px] text-notion-muted">
        没有找到匹配的项目。
      </div>
    );
  }

  return (
    <div className="divide-y divide-notion-line border-y border-notion-line">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
