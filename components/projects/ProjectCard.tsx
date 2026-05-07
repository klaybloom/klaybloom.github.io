import Link from "next/link";
import type { Project } from "@/content/types";
import { formatProjectDate, getProjectStatusLabel } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="border-b border-notion-line py-6 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-notion-faint">
            <span className="rounded-full border border-notion-line bg-white/72 px-2.5 py-1">
              {getProjectStatusLabel(project.status)}
            </span>
            <span>{formatProjectDate(project.date)}</span>
            <span>{project.category}</span>
          </div>
          <h2 className="text-[19px] font-semibold text-notion-text">
            <Link href={`/projects/${project.slug}`}>{project.title}</Link>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span
                className="rounded-full bg-notion-hover px-2.5 py-1 text-[12px] text-notion-muted"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 text-[14px]">
          <a
            className="rounded-full px-3 py-1 font-medium text-notion-accent transition hover:bg-notion-accentSoft"
            href={project.github}
          >
            GitHub
          </a>
          {project.demo.startsWith("/") ? (
            <Link
              className="rounded-full px-3 py-1 font-medium text-notion-accent transition hover:bg-notion-accentSoft"
              href={project.demo}
            >
              Preview
            </Link>
          ) : (
            <a
              className="rounded-full px-3 py-1 font-medium text-notion-accent transition hover:bg-notion-accentSoft"
              href={project.demo}
            >
              Preview
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
