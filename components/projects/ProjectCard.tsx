import Link from "next/link";
import type { Project } from "@/content/types";
import { formatProjectDate, getProjectStatusLabel } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const card = (
    <article className="tahoe-project-card h-full">
      <div className={`tahoe-project-art tahoe-project-art-${(index % 4) + 1}`} />
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[color:var(--tahoe-faint)]">
          <span className="tahoe-status">{getProjectStatusLabel(project.status)}</span>
          <span>{formatProjectDate(project.date)}</span>
        </div>
        <h3 className="text-[18px] font-semibold leading-snug text-[color:var(--tahoe-text)]">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[color:var(--tahoe-muted)]">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((item) => (
            <span className="tahoe-small-tag" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  return project.demo?.startsWith("/") ? (
    <Link href={project.demo} key={project.slug}>
      {card}
    </Link>
  ) : (
    <a href={project.demo || project.github} key={project.slug}>
      {card}
    </a>
  );
}
