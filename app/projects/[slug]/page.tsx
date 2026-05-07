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

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      <article className="mx-auto max-w-[760px] px-5 pb-20 pt-16">
        <Link
          className="mb-10 inline-flex rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
          href="/projects"
        >
          ← 返回项目列表
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap gap-2 text-[12px] text-notion-faint">
            <span className="rounded-full border border-notion-line bg-white/72 px-2.5 py-1">
              {getProjectStatusLabel(project.status)}
            </span>
            <span className="rounded-full border border-notion-line bg-white/72 px-2.5 py-1">
              {formatProjectDate(project.date)}
            </span>
            <span className="rounded-full border border-notion-line bg-white/72 px-2.5 py-1">
              {project.category}
            </span>
          </div>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-notion-text sm:text-6xl">
            {project.title}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxedBody text-notion-muted">
            {project.description}
          </p>
        </header>

        <div className="space-y-10 rounded-[24px] border border-notion-line bg-notion-paper/92 px-5 py-8 sm:px-8">
          <section>
            <h2 className="mb-4 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold">
              项目说明
            </h2>
            <p className="text-[15px] leading-relaxedBody text-notion-muted">
              {project.longDescription}
            </p>
          </section>

          <section>
            <h2 className="mb-4 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold">
              技术栈
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  className="rounded-full bg-notion-hover px-3 py-1 text-[13px] text-notion-muted"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold">
              链接
            </h2>
            <div className="flex flex-wrap gap-2 text-[14px]">
              <a
                className="rounded-full border border-notion-accent bg-notion-accent px-4 py-2 font-medium text-white transition hover:bg-[#1f735d]"
                href={project.github}
              >
                GitHub
              </a>
              {project.demo.startsWith("/") ? (
                <Link
                  className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
                  href={project.demo}
                >
                  在线预览
                </Link>
              ) : (
                <a
                  className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
                  href={project.demo}
                >
                  在线预览
                </a>
              )}
            </div>
          </section>
        </div>
      </article>
      <Footer nav={siteConfig.nav} />
    </main>
  );
}
