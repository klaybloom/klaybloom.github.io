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
    <main data-tahoe-preview className="tahoe-shell min-h-screen overflow-x-hidden">
      <div className="tahoe-bg-fixed" aria-hidden />
      <Header name={siteConfig.name} nav={siteConfig.nav} />

      {headings.length ? (
        <aside className="group fixed left-4 top-32 z-40 hidden lg:block">
          <button
            type="button"
            aria-label="展开文章目录"
            className="tahoe-mini-button flex h-10 w-10 items-center justify-center !rounded-full font-mono text-[18px] font-semibold"
            style={{ color: "var(--tahoe-accent)" }}
          >
            ≡
          </button>
          <div className="pointer-events-none absolute left-10 top-0 w-72 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <nav className="tahoe-system-card max-h-[calc(100vh-9rem)] overflow-y-auto !p-4">
              <p
                className="mb-3 text-[12px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--tahoe-accent)" }}
              >
                文章目录
              </p>
              <div className="grid gap-1">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block rounded-md px-2 py-1 text-[13px] leading-snug transition hover:bg-[color:var(--tahoe-glass-strong)] ${
                      heading.level === 3 ? "ml-3" : ""
                    }`}
                    style={{ color: "var(--tahoe-muted)" }}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </aside>
      ) : null}

      <div className="relative z-10 mx-auto max-w-[760px] px-4 pb-20 pt-28 sm:px-6">
        <article>
          <Link
            className="tahoe-link-button mb-10 inline-flex"
            href="/blog"
          >
            ← 返回文章列表
          </Link>

          <header className="mb-10">
            <p
              className="mb-4 text-[13px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: "var(--tahoe-accent)" }}
            >
              {formatPostDate(post.date)}
              {post.category ? ` · ${post.category}` : ""}
            </p>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight text-[color:var(--tahoe-text)]">
              {post.title}
            </h1>
            {post.description ? (
              <p className="mt-5 text-[17px] leading-8 text-[color:var(--tahoe-muted)]">
                {post.description}
              </p>
            ) : null}
            {post.tags.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span className="tahoe-small-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {post.cover ? (
            <div className="tahoe-system-card group relative mb-12 overflow-hidden !p-0">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] aspect-[16/9] md:aspect-[21/9]"
              />
            </div>
          ) : null}

          <div
            className="markdown-body tahoe-custom-body"
            style={{ padding: "clamp(24px, 4vw, 48px)" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {(newerPost || olderPost) ? (
            <nav className="mt-12 grid gap-3 pt-8 sm:grid-cols-2" style={{ borderTop: "1px solid var(--tahoe-card-border)" }}>
              {newerPost ? (
                <Link
                  className="tahoe-system-card !p-4 transition hover:border-[color:var(--tahoe-accent)]"
                  href={`/blog/${newerPost.slug}`}
                >
                  <span className="block text-[12px] text-[color:var(--tahoe-faint)]">上一篇</span>
                  <span className="mt-1 block text-[14px] font-medium text-[color:var(--tahoe-text)]">{newerPost.title}</span>
                </Link>
              ) : <div />}
              {olderPost ? (
                <Link
                  className="tahoe-system-card !p-4 text-right transition hover:border-[color:var(--tahoe-accent)]"
                  href={`/blog/${olderPost.slug}`}
                >
                  <span className="block text-[12px] text-[color:var(--tahoe-faint)]">下一篇</span>
                  <span className="mt-1 block text-[14px] font-medium text-[color:var(--tahoe-text)]">{olderPost.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>
      </div>

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
