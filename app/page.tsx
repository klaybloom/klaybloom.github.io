import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero, ProfileAbout } from "@/components/home/Hero";
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
    <main
      data-tahoe-preview data-fangyuan
      className="tahoe-shell min-h-screen overflow-x-hidden"
    >
      <div className="tahoe-bg-fixed" aria-hidden />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="fy-home-content relative z-10 mx-auto max-w-[1200px] px-4 pb-12 pt-28 sm:px-6">
        <div className="fy-home-sections">
          {sections.map((section) =>
            <div key={section.id} className={`fy-section fy-section-${section.type}`}>
              {renderTahoeSection(section, nextNumber, customHtml)}
            </div>
          )}
          {sections.some((section) => section.type === "hero") ? <ProfileAbout profile={profile} highlights={highlights} /> : null}
        </div>
      </div>

      <Footer nav={siteConfig.nav} />
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
