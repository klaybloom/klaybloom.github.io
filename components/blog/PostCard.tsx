import Link from "next/link";
import type { PostSummary } from "@/lib/post-types";
import { formatDate } from "@/lib/date";

const DEFAULT_COVER = "/images/default-cover.jpg";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  const hasCover = post.cover && post.cover !== DEFAULT_COVER;

  return (
    <article className="border-b border-notion-line py-6 last:border-b-0">
      <div className="flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-start">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap gap-2 text-[12px] text-notion-faint">
            <span>{formatDate(post.date)}</span>
            {post.category ? <span>{post.category}</span> : null}
          </div>
          <h2 className="text-[19px] font-semibold text-notion-text hover:text-notion-accent transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          {post.description ? (
            <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted line-clamp-3">
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
        </div>

        {hasCover ? (
          <Link 
            href={`/blog/${post.slug}`} 
            className="group relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-notion-line sm:w-44 sm:aspect-square md:w-48"
          >
            <img
              src={post.cover}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
