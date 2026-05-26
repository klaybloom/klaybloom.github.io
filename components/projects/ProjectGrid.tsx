import type { Project } from "@/content/types";
import { ProjectCard } from "./ProjectCard";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="tahoe-system-card py-12 text-center text-[15px] text-[color:var(--tahoe-muted)]">
        没有找到匹配的项目。
      </div>
    );
  }

  return (
    <div className="tahoe-project-grid">
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </div>
  );
}
