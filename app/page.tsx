import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Skills } from "@/components/home/Skills";
import { Projects } from "@/components/home/Projects";
import { Posts } from "@/components/home/Posts";
import { Experience } from "@/components/home/Experience";
import { CustomSection } from "@/components/home/CustomSection";

import { experience } from "@/content/experience";
import { highlights } from "@/content/highlights";
import { profile } from "@/content/profile";
import { siteConfig } from "@/content/site";
import { skills } from "@/content/skills";
import homeSectionsData from "@/content/home-sections.json";

import { resolveHomeSections, type HomeSection } from "@/lib/home-sections";
import { markdownToHtml } from "@/lib/markdown";
import { getLatestPosts } from "@/lib/posts";
import { getLatestProjects } from "@/lib/projects";

export default async function Home() {
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
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      <TahoeSectionRail sections={sections} />

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 pb-20 pt-28 sm:px-6">
        <div className="space-y-20">
          {sections.map((section) =>
            renderTahoeSection(section, nextNumber, customHtml)
          )}
        </div>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}

const SECTION_ANCHORS: Record<string, { anchor: string; label: string }> = {
  skills: { anchor: "#skills", label: "技术" },
  "latest-projects": { anchor: "#projects", label: "项目" },
  "latest-posts": { anchor: "#articles", label: "文章" },
  experience: { anchor: "#experience", label: "经历" },
  custom: { anchor: "", label: "" },
};

function TahoeSectionRail({ sections }: { sections: HomeSection[] }) {
  const items = sections
    .filter((s) => s.type === "custom" || s.type in SECTION_ANCHORS)
    .map((s) => {
      const entry = SECTION_ANCHORS[s.type];
      if (!entry) return null;
      if (s.type === "custom") {
        return { href: `#custom-${s.id}`, label: s.params?.title ?? "" };
      }
      return { href: entry.anchor, label: entry.label };
    })
    .filter((item): item is { href: string; label: string } => item !== null && item.label !== "");

  return (
    <nav aria-label="页面段落" className="tahoe-section-rail">
      {items.map((item) => (
        <a href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function renderTahoeSection(
  section: HomeSection,
  nextNumber: () => string,
  customHtml: Map<string, string>
) {
  switch (section.type) {
    case "hero":
      return <Hero key={section.id} profile={profile} highlights={highlights} />;
    case "skills":
      return (
        <Skills
          key={section.id}
          skills={skills}
          number={nextNumber()}
          title={section.params?.title ?? "技术能力"}
        />
      );
    case "latest-projects":
      return (
        <Projects
          key={section.id}
          number={nextNumber()}
          projects={getLatestProjects(section.params?.count ?? 3)}
          title={section.params?.title ?? "精选项目"}
        />
      );
    case "latest-posts":
      return (
        <Posts
          key={section.id}
          number={nextNumber()}
          posts={getLatestPosts(section.params?.count ?? 3)}
          title={section.params?.title ?? "技术文章"}
        />
      );
    case "experience":
      return (
        <Experience
          key={section.id}
          items={experience}
          number={nextNumber()}
          title={section.params?.title ?? "工作经历"}
        />
      );
    case "custom":
      return (
        <CustomSection
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
