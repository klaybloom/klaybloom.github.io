import { describe, expect, it } from "vitest";
import { createPostSummary } from "../lib/posts";

describe("blog search payload", () => {
  it("indexes metadata without embedding the full article body", () => {
    const summary = createPostSummary({
      slug: "search-test",
      title: "Metadata title",
      date: "2026-07-29",
      description: "Metadata description",
      tags: ["MetadataTag"],
      category: "MetadataCategory",
      cover: "/images/default-cover.jpg",
      published: true,
      featured: false,
      content: "body-only-secret-token",
    });

    expect(summary.searchText).toContain("metadata title");
    expect(summary.searchText).toContain("metadata description");
    expect(summary.searchText).toContain("metadatatag");
    expect(summary.searchText).toContain("metadatacategory");
    expect(summary.searchText).not.toContain("body-only-secret-token");
    expect(summary).not.toHaveProperty("content");
  });
});
