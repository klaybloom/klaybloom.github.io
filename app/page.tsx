import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { LatestPosts } from "@/components/home/LatestPosts";
import { LatestProjects } from "@/components/home/LatestProjects";
import { Skills } from "@/components/home/Skills";
import { CustomSection } from "@/components/home/CustomSection";
import { experience } from "@/content/experience";
import { highlights } from "@/content/highlights";
import { profile } from "@/content/profile";
import { siteConfig } from "@/content/site";
import { skills } from "@/content/skills";
import { Interactions } from "@/components/Interactions";
import { getLatestPosts } from "@/lib/posts";
import { getLatestProjects } from "@/lib/projects";
import { markdownToHtml } from "@/lib/markdown";
import { resolveHomeSections, type HomeSection } from "@/lib/home-sections";
import homeSectionsData from "@/content/home-sections.json";

export default async function Home() {
  const sections = resolveHomeSections(homeSectionsData);
  const enabled = sections.filter((s) => s.enabled);

  // Pre-render custom block HTML in parallel (markdownToHtml is async)
  const customHtml = new Map<string, string>();
  await Promise.all(
    enabled
      .filter((s) => s.type === "custom")
      .map(async (s) => {
        const body = s.params?.body ?? "";
        customHtml.set(s.id, body ? await markdownToHtml(body) : "");
      })
  );

  // Numbering: Hero is unnumbered. Other sections get sequential 01, 02, ...
  let n = 0;
  const nextNumber = () => String(++n).padStart(2, "0");

  const rendered = enabled.map((s) => renderSection(s, nextNumber, customHtml));

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Interactions />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="mx-auto max-w-[1080px] px-5 pb-20 pt-10">
        <div className="space-y-20">{rendered}</div>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}

function renderSection(
  s: HomeSection,
  nextNumber: () => string,
  customHtml: Map<string, string>
) {
  switch (s.type) {
    case "hero":
      return <Hero key={s.id} profile={profile} highlights={highlights} />;
    case "skills":
      return (
        <Skills
          key={s.id}
          skills={skills}
          title={s.params?.title}
          number={nextNumber()}
        />
      );
    case "latest-projects":
      return (
        <LatestProjects
          key={s.id}
          projects={getLatestProjects(s.params?.count ?? 3)}
          title={s.params?.title}
          number={nextNumber()}
        />
      );
    case "latest-posts":
      return (
        <LatestPosts
          key={s.id}
          posts={getLatestPosts(s.params?.count ?? 3)}
          title={s.params?.title}
          number={nextNumber()}
        />
      );
    case "experience":
      return (
        <Experience
          key={s.id}
          items={experience}
          title={s.params?.title}
          number={nextNumber()}
        />
      );
    case "custom":
      return (
        <CustomSection
          key={s.id}
          sectionId={`custom-${s.id}`}
          title={s.params?.title ?? "新区块"}
          bodyHtml={customHtml.get(s.id) ?? ""}
          number={nextNumber()}
        />
      );
    default:
      return null;
  }
}
