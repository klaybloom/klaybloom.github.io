import Link from "next/link";
import type { PostSummary } from "@/lib/post-types";
import { formatDate } from "@/lib/date";
import { Section } from "./Section";

type PostsProps = {
  posts: PostSummary[];
  title: string;
  number: string;
};

export function Posts({ posts, title, number }: PostsProps) {
  return (
    <Section
      actionHref="/blog"
      actionLabel="全部 →"
      id="articles"
      number={number}
      title={title}
    >
      <div className="tahoe-post-grid">
        {posts.map((post) => (
          <Link className="tahoe-post-tile" href={`/blog/${post.slug}`} key={post.slug}>
            <div className="mb-7 flex items-center justify-between gap-3">
              <time className="text-[15px] font-medium text-[color:var(--tahoe-faint)]">
                {formatDate(post.date)}
              </time>
              {post.category ? <span className="tahoe-status">{post.category}</span> : null}
            </div>
            <h3 className="text-[20px] font-semibold leading-snug text-[color:var(--tahoe-text)]">
              {post.title}
            </h3>
            {post.description ? (
              <p className="mt-5 line-clamp-3 text-[16px] leading-8 text-[color:var(--tahoe-muted)]">
                {post.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </Section>
  );
}
