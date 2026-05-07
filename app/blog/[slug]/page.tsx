import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/content/site";
import { markdownToHtml } from "@/lib/markdown";
import { formatPostDate, getAllPostSlugs, getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | ${siteConfig.title}`,
    description: post.description
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = await markdownToHtml(post.content);

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      <article className="mx-auto max-w-[760px] px-5 pb-20 pt-16">
        <Link
          className="mb-10 inline-flex rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
          href="/blog"
        >
          ← 返回文章列表
        </Link>

        <header className="mb-10">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.24em] text-notion-accent">
            {formatPostDate(post.date)}
            {post.category ? ` · ${post.category}` : ""}
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-notion-text sm:text-6xl">
            {post.title}
          </h1>
          {post.description ? (
            <p className="mt-5 text-[17px] leading-relaxedBody text-notion-muted">
              {post.description}
            </p>
          ) : null}
          {post.tags.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  className="rounded-full bg-notion-hover px-3 py-1 text-[13px] text-notion-muted"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
      <Footer nav={siteConfig.nav} />
    </main>
  );
}
