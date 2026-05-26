import type { Metadata } from "next";
import Link from "next/link";
import { experience } from "@/content/experience";
import { highlights } from "@/content/highlights";
import { profile } from "@/content/profile";
import { siteConfig } from "@/content/site";
import { skills } from "@/content/skills";
import homeSectionsData from "@/content/home-sections.json";
import type { ExperienceItem, Highlight, Profile, Project, SkillGroup } from "@/content/types";
import { formatDate } from "@/lib/date";
import { markdownToHtml } from "@/lib/markdown";
import { getLatestPosts } from "@/lib/posts";
import type { PostSummary } from "@/lib/post-types";
import { getLatestProjects } from "@/lib/projects";
import { resolveHomeSections, type HomeSection } from "@/lib/home-sections";
import { TahoeModeToggle } from "./TahoeSideNav";

export const metadata: Metadata = {
  title: "主题预览 2 · Tahoe Liquid Glass",
  description: "第二套 macOS Tahoe / Liquid Glass 风格预览方案",
};

export default async function ThemePreview2Page() {
  const sections = resolveHomeSections(homeSectionsData).filter((section) => section.enabled);
  const customHtml = new Map<string, string>();

  await Promise.all(
    sections
      .filter((section) => section.type === "custom")
      .map(async (section) => {
        const body = section.params?.body ?? "";
        customHtml.set(section.id, body ? await markdownToHtml(body) : "");
      })
  );

  let n = 0;
  const nextNumber = () => String(++n).padStart(2, "0");

  return (
    <main data-tahoe-preview className="tahoe-shell min-h-screen overflow-x-hidden">
      <div className="tahoe-bg-fixed" aria-hidden />

      <header className="tahoe-menubar flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
        <Link href="/" className="tahoe-brand" aria-label="返回首页">
          <span className="tahoe-brand-mark">K</span>
          <span>{siteConfig.name}</span>
        </Link>
        <div className="tahoe-banner-nav">
          <a href="#skills">技术</a>
          <a href="#projects">项目</a>
          <a href="#articles">文章</a>
          <a href="#experience">经历</a>
          <TahoeModeToggle />
          <Link href="/theme-preview" className="tahoe-mini-button">
            对比方案 1
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 pb-20 pt-28 sm:px-6">
        <div className="space-y-20">
          {sections.map((section) =>
            renderTahoeSection(section, nextNumber, customHtml)
          )}
        </div>
      </div>
    </main>
  );
}

function renderTahoeSection(
  section: HomeSection,
  nextNumber: () => string,
  customHtml: Map<string, string>
) {
  switch (section.type) {
    case "hero":
      return <TahoeHero key={section.id} profile={profile} highlights={highlights} />;
    case "skills":
      return (
        <TahoeSkills
          key={section.id}
          skills={skills}
          number={nextNumber()}
          title={section.params?.title ?? "技术能力"}
        />
      );
    case "latest-projects":
      return (
        <TahoeProjects
          key={section.id}
          number={nextNumber()}
          projects={getLatestProjects(section.params?.count ?? 3)}
          title={section.params?.title ?? "精选项目"}
        />
      );
    case "latest-posts":
      return (
        <TahoePosts
          key={section.id}
          number={nextNumber()}
          posts={getLatestPosts(section.params?.count ?? 3)}
          title={section.params?.title ?? "技术文章"}
        />
      );
    case "experience":
      return (
        <TahoeExperience
          key={section.id}
          items={experience}
          number={nextNumber()}
          title={section.params?.title ?? "工作经历"}
        />
      );
    case "custom":
      return (
        <TahoeCustomSection
          key={section.id}
          number={nextNumber()}
          sectionId={`custom-${section.id}`}
          title={section.params?.title ?? "新区块"}
          bodyHtml={customHtml.get(section.id) ?? ""}
        />
      );
    default:
      return null;
  }
}

function TahoeHero({
  profile,
  highlights,
}: {
  profile: Profile;
  highlights: Highlight[];
}) {
  return (
    <section id="home" className="tahoe-hero tahoe-window relative overflow-hidden">
      <WindowDots />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="relative z-10">
          <p className="tahoe-kicker">Hello, I&apos;m</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-normal text-[color:var(--tahoe-text)]">
            {profile.nickname}
          </h1>
          <p className="mt-5 max-w-[560px] text-[1.2rem] leading-8 text-[color:var(--tahoe-muted)]">
            {profile.summary}
          </p>
          {profile.bio.length ? (
            <div className="mt-5 max-w-[560px] text-[15px] leading-8 text-[color:var(--tahoe-faint)]">
              {profile.bio.map((item) => (
                <p className="[&+p]:mt-3" key={item}>
                  {item}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="tahoe-system-card relative z-10">
          <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase text-[color:var(--tahoe-accent)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--tahoe-accent)] shadow-[0_0_0_5px_var(--tahoe-accent-soft)]" />
            Current Status
          </div>
          <div className="space-y-3 text-[14px] leading-7 text-[color:var(--tahoe-muted)]">
            {highlights.map((item) => (
              <p key={item.label}>{item.value}</p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TahoeSkills({
  skills,
  title,
  number,
}: {
  skills: SkillGroup[];
  title: string;
  number: string;
}) {
  return (
    <TahoeSection id="skills" number={number} title={title}>
      <div className="tahoe-skill-grid">
        {skills.map((skill) => (
          <article className="tahoe-skill-card" key={skill.group}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-semibold text-[color:var(--tahoe-text)]">
                {skill.group}
              </h3>
              <span className="tahoe-status">{skill.items.length}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span className="tahoe-small-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </TahoeSection>
  );
}

function TahoeProjects({
  projects,
  title,
  number,
}: {
  projects: Project[];
  title: string;
  number: string;
}) {
  return (
    <TahoeSection
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

          return project.demo.startsWith("/") ? (
            <Link href={project.demo} key={project.slug}>
              {card}
            </Link>
          ) : (
            <a href={project.demo} key={project.slug}>
              {card}
            </a>
          );
        })}
      </div>
    </TahoeSection>
  );
}

function TahoePosts({
  posts,
  title,
  number,
}: {
  posts: PostSummary[];
  title: string;
  number: string;
}) {
  return (
    <TahoeSection
      actionHref="/blog"
      actionLabel="全部 →"
      id="articles"
      number={number}
      title={title}
    >
      <div className="tahoe-post-grid">
        {posts.map((post) => (
          <Link className="tahoe-post-tile" href={`/blog/${post.slug}`} key={post.slug}>
            <div className="mb-7 flex items-center justify-between gap-3">
              <time className="text-[15px] font-medium text-[color:var(--tahoe-faint)]">
                {formatDate(post.date)}
              </time>
              {post.category ? <span className="tahoe-status">{post.category}</span> : null}
            </div>
            <h3 className="text-[20px] font-semibold leading-snug text-[color:var(--tahoe-text)]">
              {post.title}
            </h3>
            {post.description ? (
              <p className="mt-5 line-clamp-3 text-[16px] leading-8 text-[color:var(--tahoe-muted)]">
                {post.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </TahoeSection>
  );
}

function TahoeExperience({
  items,
  title,
  number,
}: {
  items: ExperienceItem[];
  title: string;
  number: string;
}) {
  return (
    <TahoeSection id="experience" number={number} title={title}>
      <div className="tahoe-timeline">
        {items.map((item) => (
          <div className="tahoe-timeline-item" key={`${item.company}-${item.title}`}>
            <span className="tahoe-timeline-dot" aria-hidden />
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              <div className="text-[13px] font-semibold text-[color:var(--tahoe-accent)]">
                {item.period}
              </div>
              <div>
                <h3 className="text-[1.1rem] font-semibold text-[color:var(--tahoe-text)]">
                  {item.title}
                </h3>
                <div className="mt-1 text-[12px] text-[color:var(--tahoe-faint)]">
                  {item.company}
                </div>
                <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[14px] leading-7 text-[color:var(--tahoe-muted)]">
                  {item.description.map((desc) => (
                    <li className="pl-1" key={desc}>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TahoeSection>
  );
}

function TahoeCustomSection({
  sectionId,
  title,
  bodyHtml,
  number,
}: {
  sectionId: string;
  title: string;
  bodyHtml: string;
  number: string;
}) {
  return (
    <TahoeSection id={sectionId} number={number} title={title}>
      <div
        className="markdown-body tahoe-custom-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </TahoeSection>
  );
}

function TahoeSection({
  actionHref,
  actionLabel,
  id,
  number,
  title,
  children,
}: {
  actionHref?: string;
  actionLabel?: string;
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="tahoe-section-head">
        <div className="flex min-w-0 items-baseline gap-4">
          <span className="text-[13px] font-semibold tracking-normal text-[color:var(--tahoe-faint)]">
            {number}
          </span>
          <h2 className="text-[1.5rem] font-semibold text-[color:var(--tahoe-text)]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="tahoe-section-action">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function WindowDots() {
  return (
    <div className="tahoe-dots" aria-hidden>
      <span className="bg-[#ff5f57]" />
      <span className="bg-[#febc2e]" />
      <span className="bg-[#28c840]" />
    </div>
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
