import Link from "next/link";
import type { Project } from "@/content/types";
import { formatDate } from "@/lib/date";
import { Section } from "./Section";

type ProjectsProps = {
  projects: Project[];
  title: string;
  number: string;
};

export function Projects({ projects, title, number }: ProjectsProps) {
  return (
    <Section
      actionHref="/projects"
      actionLabel="全部 →"
      id="projects"
      number={number}
      title={title}
    >
      <div className="tahoe-project-grid">
        {projects.map((project, index) => {
          const card = (
            <article className="tahoe-project-card h-full">
              <div className={`tahoe-project-art tahoe-project-art-${(index % 4) + 1}`} />
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[color:var(--tahoe-faint)]">
                  <span className="tahoe-status">{getStatusText(project.status)}</span>
                  <span>{formatDate(project.updated || project.date)}</span>
                </div>
                <h3 className="text-[18px] font-semibold leading-snug text-[color:var(--tahoe-text)]">
                  {project.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[color:var(--tahoe-muted)]">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.slice(0, 3).map((item) => (
                    <span className="tahoe-small-tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );

          return (
            <Link href={`/projects/${project.slug}`} key={project.slug}>
              {card}
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

function getStatusText(status: Project["status"]) {
  const labels: Record<Project["status"], string> = {
    planning: "规划中",
    building: "进行中",
    launched: "已上线",
    paused: "已暂停",
    archived: "已归档",
  };

  return labels[status];
}
