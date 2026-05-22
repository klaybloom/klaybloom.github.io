import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { LatestPosts } from "@/components/home/LatestPosts";
import { LatestProjects } from "@/components/home/LatestProjects";
import { Skills } from "@/components/home/Skills";
import { experience } from "@/content/experience";
import { highlights } from "@/content/highlights";
import { profile } from "@/content/profile";
import { siteConfig } from "@/content/site";
import { skills } from "@/content/skills";
import { Interactions } from "@/components/Interactions";
import { getLatestPosts } from "@/lib/posts";
import { getLatestProjects } from "@/lib/projects";

export default function Home() {
  const latestProjects = getLatestProjects(3);
  const latestPosts = getLatestPosts(3);

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Interactions />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="mx-auto max-w-[1080px] px-5 pb-20 pt-10">
        <Hero profile={profile} highlights={highlights} />

        <div className="space-y-20">
          <Skills skills={skills} />
          <LatestProjects projects={latestProjects} />
          <LatestPosts posts={latestPosts} />
          <Experience items={experience} />
        </div>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}
