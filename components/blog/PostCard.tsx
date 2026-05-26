import Link from "next/link";
import type { PostSummary } from "@/lib/post-types";
import { formatDate } from "@/lib/date";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link className="tahoe-post-tile" href={`/blog/${post.slug}`}>
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
      {post.tags.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span className="tahoe-small-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
