import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  name: "Klay's Studio",
  title: "klay's studio",
  description:
    "klay 的个人主站，展示 Java 后端开发、微服务架构、高并发系统与 AI 工作流自动化相关经历、项目和技术文章。",
  url: "https://klaybloom.github.io",
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "Project Lab", href: "/projects" },
    { label: "GitHub", href: "https://github.com/klaybloom" },
    { label: "Email", href: "mailto:your-email@example.com" }
  ]
};
