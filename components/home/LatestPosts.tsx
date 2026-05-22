import Link from "next/link";
import { formatDate } from "@/lib/date";
import type { PostSummary } from "@/lib/posts-types";
import { Section } from "./Section";

type LatestPostsProps = {
  posts: PostSummary[];
};

export function LatestPosts({ posts }: LatestPostsProps) {
  return (
    <Section id="articles" number="03" title="技术文章">
      <div>
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group grid grid-cols-[120px_1fr] items-start gap-8 border-b border-notion-line py-5 transition-all hover:pl-3 first:border-t [&:first-child]:border-t animate-on-scroll stagger-${(index % 4) + 1}`}
          >
            <span className="font-mono text-[12px] text-notion-faint">
              {formatDate(post.date)}
            </span>
            <div>
              <h3 className="text-[15px] font-medium transition-colors group-hover:text-notion-accent">
                {post.title}
              </h3>
              {post.description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-notion-faint">
                  {post.description}
                </p>
              ) : null}
              {post.category ? (
                <span className="mt-2 inline-block font-mono text-[11px] text-notion-accent">
                  {post.category}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 rounded-md border border-notion-accent px-4 py-2 font-mono text-[13px] font-medium text-notion-accent transition-all hover:bg-notion-accent hover:text-white"
      >
        View All Articles &rarr;
      </Link>
    </Section>
  );
}
