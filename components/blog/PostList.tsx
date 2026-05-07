import type { PostSummary } from "@/lib/posts";
import { PostCard } from "./PostCard";

type PostListProps = {
  posts: PostSummary[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="border-y border-notion-line py-10 text-center text-[15px] text-notion-muted">
        没有找到匹配的文章。
      </div>
    );
  }

  return (
    <div className="divide-y divide-notion-line border-y border-notion-line">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
