import Link from "next/link";
import type { Project } from "@/content/types";
import { Section } from "./Section";

type LatestProjectsProps = {
  projects: Project[];
};

export function LatestProjects({ projects }: LatestProjectsProps) {
  return (
    <Section id="projects" title="精选项目">
      <div className="divide-y divide-notion-line border-y border-notion-line">
        {projects.map((project) => (
          <article key={project.slug} className="py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[17px] font-semibold">{project.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
                  {project.description}
                </p>
                <p className="mt-3 text-[13px] text-notion-faint">
                  {project.stack.join(" · ")}
                </p>
              </div>
              {project.demo.startsWith("/") ? (
                <Link
                  href={project.demo}
                  className="shrink-0 rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
                >
                  查看项目 →
                </Link>
              ) : (
                <a
                  href={project.demo}
                  className="shrink-0 rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
                >
                  查看项目 →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
