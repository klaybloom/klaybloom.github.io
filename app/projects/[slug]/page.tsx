import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/content/site";
import {
  formatProjectDate,
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectStatusLabel
} from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} | ${siteConfig.title}`,
    description: project.description
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const statusDescription = getProjectStatusDescription(project.status);

  return (
    <main data-tahoe-preview className="tahoe-shell min-h-screen overflow-x-hidden">
      <div className="tahoe-bg-fixed" aria-hidden />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="relative z-10 mx-auto max-w-[760px] px-4 pb-20 pt-28 sm:px-6">
        <article>
          <Link
            className="tahoe-link-button mb-10 inline-flex"
            href="/projects"
          >
            ← 返回项目列表
          </Link>

          <header className="mb-10">
            <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
              <span className="tahoe-status">
                {getProjectStatusLabel(project.status)}
              </span>
              <span className="tahoe-small-tag">
                创建于 {formatProjectDate(project.date)}
              </span>
              <span className="tahoe-small-tag">
                更新于 {formatProjectDate(project.updated)}
              </span>
              <span className="tahoe-small-tag">
                {project.category}
              </span>
            </div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight text-[color:var(--tahoe-text)]">
              {project.title}
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-[color:var(--tahoe-muted)]">
              {project.description}
            </p>
          </header>

          {project.cover ? (
            <div className="tahoe-system-card mb-10 overflow-hidden !p-0">
              <img
                src={project.cover}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="tahoe-experience-card space-y-10">
            <section>
              <h2
                className="mb-4 border-l-4 pl-3 text-[15px] font-semibold"
                style={{ borderColor: "var(--tahoe-accent)", color: "var(--tahoe-text)" }}
              >
                项目说明
              </h2>
              <p className="text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
                {project.longDescription}
              </p>
            </section>

            <section>
              <h2
                className="mb-4 border-l-4 pl-3 text-[15px] font-semibold"
                style={{ borderColor: "var(--tahoe-accent)", color: "var(--tahoe-text)" }}
              >
                当前状态
              </h2>
              <p className="text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
                {statusDescription}
              </p>
            </section>

            <section>
              <h2
                className="mb-4 border-l-4 pl-3 text-[15px] font-semibold"
                style={{ borderColor: "var(--tahoe-accent)", color: "var(--tahoe-text)" }}
              >
                技术栈
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span className="tahoe-small-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2
                className="mb-4 border-l-4 pl-3 text-[15px] font-semibold"
                style={{ borderColor: "var(--tahoe-accent)", color: "var(--tahoe-text)" }}
              >
                链接
              </h2>
              <div className="flex flex-wrap gap-3 text-[14px]">
                <a
                  className="tahoe-button tahoe-button-primary"
                  href={project.github}
                >
                  GitHub
                </a>
                {project.demo?.startsWith("/") ? (
                  <Link
                    className="tahoe-button tahoe-button-glass"
                    href={project.demo}
                  >
                    在线预览
                  </Link>
                ) : project.demo ? (
                  <a
                    className="tahoe-button tahoe-button-glass"
                    href={project.demo}
                  >
                    在线预览
                  </a>
                ) : null}
              </div>
            </section>
          </div>
        </article>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}

function getProjectStatusDescription(status: string) {
  const descriptions: Record<string, string> = {
    planning: "项目仍在规划中，功能边界和技术路线还会继续调整。",
    building: "项目正在建设和迭代中，当前版本可用于了解方向和阶段性成果。",
    launched: "项目已经上线，可通过预览链接查看当前可用版本。",
    paused: "项目暂时暂停维护，后续是否继续取决于实际需求。",
    archived: "项目已归档，主要作为历史记录和作品展示保留。",
  };

  return descriptions[status] ?? "项目状态待补充。";
}
