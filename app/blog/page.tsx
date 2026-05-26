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
    <main data-tahoe-preview className="tahoe-shell min-h-screen overflow-x-hidden">
      <div className="tahoe-bg-fixed" aria-hidden />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 pb-20 pt-28 sm:px-6">
        <section>
          <div className="tahoe-section-head mb-10">
            <div className="flex min-w-0 items-baseline gap-4">
              <span className="text-[13px] font-semibold tracking-normal text-[color:var(--tahoe-faint)]">
                01
              </span>
              <h1 className="text-[1.5rem] font-semibold text-[color:var(--tahoe-text)]">
                Blog
              </h1>
            </div>
          </div>

          <p className="mb-10 max-w-2xl text-[15px] leading-8 text-[color:var(--tahoe-muted)]">
            记录 Java 后端、微服务、AI 工具链和项目构建过程中的经验。
          </p>

          <BlogFilter posts={posts} tags={tags} />
        </section>
      </div>

      <Footer nav={siteConfig.nav} />
    </main>
  );
}
