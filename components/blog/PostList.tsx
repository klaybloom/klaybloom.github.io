import type { PostSummary } from "@/lib/post-types";
import { PostCard } from "./PostCard";

type PostListProps = {
  posts: PostSummary[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="tahoe-system-card py-12 text-center text-[15px] text-[color:var(--tahoe-muted)]">
        没有找到匹配的文章。
      </div>
    );
  }

  return (
    <div className="tahoe-post-grid">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
