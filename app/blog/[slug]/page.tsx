import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TOCScrollActive } from "@/components/blog/TOCScrollActive";
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

  const fullUrl = `${siteConfig.url}/blog/${slug}/`;
  const imageUrl = post.cover ? `${siteConfig.url}${post.cover}` : `${siteConfig.url}/images/default-cover.jpg`;

  return {
    title: `${post.title} | ${siteConfig.title}`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: fullUrl,
      images: [{ url: imageUrl, alt: post.title }],
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [imageUrl],
    }
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
      <TOCScrollActive />

      {headings.length ? (
        <aside className="fixed left-4 top-32 z-40 hidden w-60 xl:block">
          <nav className="tahoe-toc-panel max-h-[calc(100vh-9rem)] overflow-y-auto">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--tahoe-accent)]">
              文章目录
            </p>
            <div className="grid gap-1">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block rounded-md px-2 py-1 text-[13px] leading-snug text-[color:var(--tahoe-muted)] transition hover:bg-[color:var(--tahoe-glass-strong)] hover:text-[color:var(--tahoe-text)] focus-visible:bg-[color:var(--tahoe-glass-strong)] focus-visible:text-[color:var(--tahoe-text)] focus-visible:outline-none ${
                    heading.level === 3 ? "ml-3" : ""
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </div>
          </nav>
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
            <div className="tahoe-media-frame relative mb-12 overflow-hidden">
              <Image
                src={post.cover}
                alt={post.title}
                width={1200}
                height={630}
                priority={true}
                className="w-full object-cover aspect-[16/9] md:aspect-[21/9]"
              />
            </div>
          ) : null}

          <div
            className="markdown-body tahoe-article-body text-[16px] leading-relaxedBody"
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
