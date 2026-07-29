import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  name: "Klay's Studio",
  title: "klay's studio",
  description:
    "klay 的个人主站，展示 Java 后端开发、微服务、AI Agent 应用、RAG 知识库问答和企业系统实践。",
  url: "https://klaybloom.github.io",
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "Project", href: "/projects" },
    { label: "GitHub", href: "https://github.com/klaybloom" },
    { label: "Email", href: "mailto:klaybloom@gmail.com" }
  ]
};
