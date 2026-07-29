import { describe, expect, it } from "vitest";
import {
  validatePostBeforeSave,
  type EditablePost,
} from "../lib/admin/forms";

function createPost(overrides: Partial<EditablePost> = {}): EditablePost {
  return {
    slug: "valid-post",
    frontmatter: {
      title: "Valid title",
      date: "2026-07-29",
      description: "Description",
      tags: ["Testing"],
      published: true,
      featured: false,
    },
    content: "Post body",
    ...overrides,
  };
}

describe("shared admin form validation", () => {
  it("rejects an unsafe slug, invalid dates and an empty body", () => {
    const result = validatePostBeforeSave(
      createPost({
        frontmatter: {
          ...createPost().frontmatter,
          date: "2026/07/29",
          updated: "not-a-date",
        },
        content: " ",
      }),
      "../unsafe",
    );

    expect(result.errors).toHaveLength(4);
  });

  it("returns publishing warnings without rejecting optional metadata", () => {
    const post = createPost({
      frontmatter: {
        ...createPost().frontmatter,
        description: "",
        tags: [],
        cover: "relative-cover.png",
      },
      content: "<script>alert(1)</script>",
    });
    const result = validatePostBeforeSave(post, post.slug);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(4);
  });
});
