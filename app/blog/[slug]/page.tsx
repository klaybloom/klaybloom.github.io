import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/content/site";
import { markdownToHtml } from "@/lib/markdown";
import {
  formatPostDate,
  getAllPostSlugs,
  getPostBySlug,
  getPublishedPosts,
} from "@/lib/posts";

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
  const headings = extractHeadings(html);
  const posts = getPublishedPosts();
  const currentIndex = posts.findIndex((item) => item.slug === slug);
  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const olderPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <Header name={siteConfig.name} nav={siteConfig.nav} />
      {headings.length ? (
        <aside className="group fixed left-4 top-32 z-40 hidden lg:block">
          <button
            type="button"
            aria-label="展开文章目录"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-notion-line bg-notion-paper/95 font-mono text-[18px] font-semibold text-notion-accent shadow-sm transition hover:border-notion-accent hover:bg-white"
          >
            ≡
          </button>
          <div className="pointer-events-none absolute left-10 top-0 w-72 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <nav className="max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-notion-line bg-notion-paper/98 p-4 shadow-lg">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-notion-accent">
                文章目录
              </p>
              <div className="grid gap-2">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block rounded-md px-2 py-1 text-[13px] leading-snug text-notion-muted transition hover:bg-notion-hover hover:text-notion-accent ${
                      heading.level === 3 ? "ml-3" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </aside>
      ) : null}

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

          {post.cover ? (
            <div className="group relative mb-12 overflow-hidden rounded-2xl border border-notion-line shadow-sm transition-all hover:shadow-md">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] aspect-[16/9] md:aspect-[21/9]"
              />
            </div>
          ) : null}

          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {(newerPost || olderPost) ? (
            <nav className="mt-12 grid gap-3 border-t border-notion-line pt-8 sm:grid-cols-2">
              {newerPost ? (
                <Link
                  className="rounded-xl border border-notion-line bg-notion-paper px-4 py-3 transition hover:border-notion-accent"
                  href={`/blog/${newerPost.slug}`}
                >
                  <span className="block text-[12px] text-notion-faint">上一篇</span>
                  <span className="mt-1 block text-[14px] font-medium text-notion-text">{newerPost.title}</span>
                </Link>
              ) : <div />}
              {olderPost ? (
                <Link
                  className="rounded-xl border border-notion-line bg-notion-paper px-4 py-3 text-right transition hover:border-notion-accent"
                  href={`/blog/${olderPost.slug}`}
                >
                  <span className="block text-[12px] text-notion-faint">下一篇</span>
                  <span className="mt-1 block text-[14px] font-medium text-notion-text">{olderPost.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
      </article>
      <Footer nav={siteConfig.nav} />
    </main>
  );
}

function extractHeadings(html: string) {
  const headings: Array<{ id: string; level: number; text: string }> = [];
  const pattern = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    headings.push({
      level: Number(match[1]),
      id: match[2],
      text: stripHtml(match[3]),
    });
  }

  return headings;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").trim();
}
