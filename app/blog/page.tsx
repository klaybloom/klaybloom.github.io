import type { Metadata } from "next";
import { BlogFilter } from "@/components/blog/BlogFilter";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/content/site";
import { getAllTags, getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.title}`,
  description: "klay 的技术文章、项目记录和长期思考。"
};

export default function BlogPage() {
  const posts = getPublishedPosts();
  const tags = getAllTags();

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      <section className="mx-auto max-w-[900px] px-5 pb-20 pt-16">
        <div className="mb-12 text-center">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.35em] text-notion-accent">
            Markdown Journal
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-notion-text sm:text-6xl">
            Blog
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxedBody text-notion-muted">
            记录 Java 后端、微服务、AI 工具链和项目构建过程中的经验。
          </p>
        </div>
        <BlogFilter posts={posts} tags={tags} />
      </section>
      <Footer nav={siteConfig.nav} />
    </main>
  );
}
