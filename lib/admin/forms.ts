import type { PostFrontmatter } from "../content-schema";

export type EditablePost = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  isNewPost?: boolean;
  originalSlug?: string;
};

export function isSafePostSlug(value: string) {
  return /^[a-z0-9][a-z0-9-_]*$/.test(value);
}

export function validatePostBeforeSave(post: EditablePost, slug: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fm = post.frontmatter;

  if (!isSafePostSlug(slug)) {
    errors.push(
      "Slug 只能使用小写字母、数字、连字符或下划线，并且必须以字母或数字开头",
    );
  }
  if (!fm.title.trim()) errors.push("文章标题不能为空");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date || "")) {
    errors.push("发布日期必须使用 YYYY-MM-DD 格式");
  }
  if (fm.updated && !/^\d{4}-\d{2}-\d{2}$/.test(fm.updated)) {
    errors.push("更新日期必须使用 YYYY-MM-DD 格式");
  }
  if (!post.content.trim()) errors.push("正文不能为空");

  if (!fm.description.trim()) {
    warnings.push("缺少文章摘要，列表页和 RSS 会不够清晰");
  }
  if (!fm.tags.filter((tag) => tag.trim()).length) {
    warnings.push("缺少标签，博客筛选效果会变差");
  }
  if (
    fm.cover &&
    !fm.cover.startsWith("/images/") &&
    !fm.cover.startsWith("https://")
  ) {
    warnings.push("封面路径建议使用 /images/... 或 https://...");
  }
  if (post.content.includes("<script")) {
    warnings.push("正文包含 script 标签，正式页面不会渲染原始 HTML");
  }

  return { errors, warnings };
}
