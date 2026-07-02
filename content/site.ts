import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  name: "Klay's Studio",
  title: "klay's studio",
  description:
    "klay 的个人主站，展示 Java 后端开发、微服务、企业级 AI 应用、RAG 知识库问答相关经历、项目和技术文章。",
  url: "https://klaybloom.github.io",
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "Project", href: "/projects" },
    { label: "GitHub", href: "https://github.com/klaybloom" },
    { label: "Email", href: "mailto:klaybloom@gmail.com" }
  ]
};
