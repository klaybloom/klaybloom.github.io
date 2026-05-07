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
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      <section className="mx-auto max-w-[900px] px-5 pb-20 pt-16">
        <div className="mb-12 text-center">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.35em] text-notion-accent">
            Project Lab
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-notion-text sm:text-6xl">
            Projects
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxedBody text-notion-muted">
            个人项目、Demo、工具和实验性作品。所有数据来自静态配置文件，适配
            GitHub Pages 静态导出。
          </p>
        </div>
        <ProjectFilter projects={projects} stacks={stacks} />
      </section>
      <Footer nav={siteConfig.nav} />
    </main>
  );
}
