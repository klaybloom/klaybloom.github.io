import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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

  const fullUrl = `${siteConfig.url}/projects/${slug}/`;
  const imageUrl = project.cover ? `${siteConfig.url}${project.cover}` : `${siteConfig.url}/images/default-cover.jpg`;

  return {
    title: `${project.title} | ${siteConfig.title}`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "website",
      url: fullUrl,
      images: [{ url: imageUrl, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [imageUrl],
    }
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

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
              <Image
                src={project.cover}
                alt={project.title}
                width={1200}
                height={675}
                priority={true}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="tahoe-experience-card space-y-10">
            {project.disclosure === "limited" ? (
              <aside
                className="rounded-2xl px-5 py-4 text-[14px] leading-7"
                style={{
                  background: "var(--tahoe-accent-soft)",
                  color: "var(--tahoe-muted)",
                }}
              >
                项目内容涉及企业内部信息，仅展示经过脱敏的职责与技术实践，不提供源码或演示地址。
              </aside>
            ) : null}

            <section>
              <CaseStudyHeading>项目背景</CaseStudyHeading>
              <p className="text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
                {project.longDescription}
              </p>
            </section>

            <section>
              <CaseStudyHeading>我的职责</CaseStudyHeading>
              <p className="mb-4 text-[14px] font-semibold text-[color:var(--tahoe-text)]">
                {project.caseStudy.role}
              </p>
              <CaseStudyList items={project.caseStudy.responsibilities} />
            </section>

            <section>
              <CaseStudyHeading>关键实现</CaseStudyHeading>
              <CaseStudyList items={project.caseStudy.highlights} />
            </section>

            <section>
              <CaseStudyHeading>交付结果</CaseStudyHeading>
              <CaseStudyList items={project.caseStudy.outcomes} />
            </section>

            <section>
              <CaseStudyHeading>技术栈</CaseStudyHeading>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span className="tahoe-small-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </section>

            {project.disclosure === "public" && (project.github || project.demo) ? (
              <section>
                <CaseStudyHeading>公开链接</CaseStudyHeading>
                <div className="flex flex-wrap gap-3 text-[14px]">
                  {project.github ? (
                    <a
                      className="tahoe-button tahoe-button-primary"
                      href={project.github}
                    >
                      GitHub
                    </a>
                  ) : null}
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
            ) : null}
          </div>
        </article>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}

function CaseStudyHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-4 border-l-4 pl-3 text-[15px] font-semibold"
      style={{
        borderColor: "var(--tahoe-accent)",
        color: "var(--tahoe-text)",
      }}
    >
      {children}
    </h2>
  );
}

function CaseStudyList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
      {items.map((item) => (
        <li className="tahoe-experience-point" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}
