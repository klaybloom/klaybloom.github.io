import Link from "next/link";
import { formatDate } from "@/lib/date";
import type { PostSummary } from "@/lib/posts";
import { Section } from "./Section";

type LatestPostsProps = {
  posts: PostSummary[];
};

export function LatestPosts({ posts }: LatestPostsProps) {
  return (
    <Section id="articles" title="技术文章">
      <div className="divide-y divide-notion-line border-y border-notion-line">
        {posts.map((post) => (
          <article key={post.slug} className="py-5">
            <p className="mb-2 text-[12px] text-notion-faint">
              {formatDate(post.date)}
              {post.category ? ` · ${post.category}` : ""}
            </p>
            <h3 className="text-[16px] font-medium">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            {post.description ? (
              <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
                {post.description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <Link
        href="/blog"
        className="mt-4 inline-flex rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
      >
        查看全部博客 →
      </Link>
    </Section>
  );
}
