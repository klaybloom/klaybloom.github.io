import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ProjectFilter } from "@/components/projects/ProjectFilter";
import { siteConfig } from "@/content/site";
import { getAllProjects, getAllStacks } from "@/lib/projects";

export const metadata: Metadata = {
  title: `Projects | ${siteConfig.title}`,
  description: "klay 的个人项目、Demo、工具和实验性作品。"
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const stacks = getAllStacks();

  return (
    <main data-tahoe-preview className="tahoe-shell min-h-screen overflow-x-hidden">
      <div className="tahoe-bg-fixed" aria-hidden />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 pb-20 pt-28 sm:px-6">
        <section>
          <div className="tahoe-section-head mb-10">
            <div className="flex min-w-0 items-baseline gap-4">
              <span className="text-[13px] font-semibold tracking-normal text-[color:var(--tahoe-faint)]">
                02
              </span>
              <h1 className="text-[1.5rem] font-semibold text-[color:var(--tahoe-text)]">
                Projects
              </h1>
            </div>
          </div>

          <p className="mb-10 max-w-2xl text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
            个人项目、Demo、工具和实验性作品。所有数据来自静态配置文件，适配 GitHub Pages 静态导出。
          </p>

          <ProjectFilter projects={projects} stacks={stacks} />
        </section>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}
