import Link from "next/link";
import type { Project } from "@/content/types";
import { Section } from "./Section";

type LatestProjectsProps = {
  projects: Project[];
};

export function LatestProjects({ projects }: LatestProjectsProps) {
  return (
    <Section id="projects" number="02" title="精选项目">
      <div className="flex flex-col gap-5">
        {projects.map((project) => {
          const cardClass =
            "group grid grid-cols-[1fr_auto] items-start gap-8 rounded-xl border border-notion-line bg-notion-paper p-7 transition-all hover:-translate-y-0.5 hover:border-notion-accent hover:shadow-[0_4px_20px_rgba(45,90,61,0.08)]";

          const inner = (
            <>
              <div>
                <h3 className="font-serif text-[1.2rem] font-semibold transition-colors group-hover:text-notion-accent">
                  {project.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-notion-muted">
                  {project.description}
                </p>
                <p className="mt-3 font-mono text-[12px] text-notion-faint">
                  {project.stack.join(" · ")}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-notion-accentSoft text-notion-accent transition-all group-hover:bg-notion-accent group-hover:text-white group-hover:translate-x-0.5">
                &rarr;
              </span>
            </>
          );

          return project.demo.startsWith("/") ? (
            <Link key={project.slug} href={project.demo} className={cardClass}>
              {inner}
            </Link>
          ) : (
            <a key={project.slug} href={project.demo} className={cardClass}>
              {inner}
            </a>
          );
        })}
      </div>
    </Section>
  );
}
