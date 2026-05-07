import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { LatestPosts } from "@/components/home/LatestPosts";
import { LatestProjects } from "@/components/home/LatestProjects";
import { Skills } from "@/components/home/Skills";
import { experience } from "@/content/experience";
import { highlights } from "@/content/highlights";
import { profile } from "@/content/profile";
import { siteConfig } from "@/content/site";
import { skills } from "@/content/skills";
import { getLatestPosts } from "@/lib/posts";
import { getLatestProjects } from "@/lib/projects";

export default function Home() {
  const latestProjects = getLatestProjects(3);
  const latestPosts = getLatestPosts(3);

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="mx-auto max-w-[760px] px-5 pb-16 pt-20">
        <Hero profile={profile} />

        <div className="space-y-14 rounded-[24px] border border-notion-line bg-notion-paper/92 px-5 py-8 sm:px-8">
          <Highlights items={highlights} />
          <Skills skills={skills} />
          <LatestProjects projects={latestProjects} />
          <LatestPosts posts={latestPosts} />
          <Experience items={experience} />

          <section id="contact" className="scroll-mt-24">
            <h2 className="mb-6 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold text-notion-text">
              联系方式
            </h2>
            <div className="grid gap-3 border-y border-notion-line py-5 text-[15px] sm:grid-cols-2">
              {siteConfig.nav.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-full px-3 py-2 text-notion-muted transition hover:bg-notion-hover hover:text-notion-text"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-full px-3 py-2 text-notion-muted transition hover:bg-notion-hover hover:text-notion-text"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </section>
        </div>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}
