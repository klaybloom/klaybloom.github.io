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
        {projects.map((project, index) => {
          const staggerClass = `stagger-${(index % 4) + 1}`;
          const cardClass = `group grid grid-cols-[1fr_auto] items-start gap-8 rounded-xl border border-notion-line bg-notion-paper p-7 transition-all hover:-translate-y-1 hover:border-notion-accent hover:shadow-[0_8px_30px_rgba(45,90,61,0.06)] animate-on-scroll ${staggerClass}`;

          const statusInfo = getStatusLabel(project.status);

          const inner = (
            <>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-[1.2rem] font-semibold transition-colors group-hover:text-notion-accent">
                    {project.title}
                  </h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide uppercase ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-notion-muted">
                  {project.description}
                </p>
                <p className="mt-3 font-mono text-[12px] text-notion-faint">
                  {project.stack.join(" · ")}
                </p>
              </div>
              <span className="magnetic flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-notion-accentSoft text-notion-accent transition-all group-hover:bg-notion-accent group-hover:text-white group-hover:translate-x-1.5">
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

function getStatusLabel(status: Project["status"]) {
  switch (status) {
    case "planning":
      return { text: "规划中", className: "bg-blue-50/80 text-blue-700 border-blue-100" };
    case "building":
      return { text: "进行中", className: "bg-amber-50/80 text-amber-700 border-amber-100" };
    case "launched":
      return { text: "已上线", className: "bg-notion-accentSoft text-notion-accent border-notion-accent/20" };
    default:
      return { text: "已暂停", className: "bg-notion-hover text-notion-faint border-notion-line" };
  }
}
