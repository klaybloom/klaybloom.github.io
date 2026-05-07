import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/date";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-notion-line py-6 last:border-b-0">
      <div className="mb-3 flex flex-wrap gap-2 text-[12px] text-notion-faint">
        <span>{formatDate(post.date)}</span>
        {post.category ? <span>{post.category}</span> : null}
      </div>
      <h2 className="text-[19px] font-semibold text-notion-text">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.description ? (
        <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
          {post.description}
        </p>
      ) : null}
      {post.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              className="rounded-full bg-notion-hover px-2.5 py-1 text-[12px] text-notion-muted"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
