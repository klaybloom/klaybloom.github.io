# Content Guide

This site is a static Next.js site. Content is maintained through Markdown and JSON files. The local-only `/admin` editor writes the same files; production remains read-only.

## Blog Posts

Add a post by creating a Markdown file in `content/posts/`.

Use this naming pattern:

```text
YYYY-MM-DD-slug.md
```

Example:

```text
2026-05-07-my-new-post.md
```

The file name becomes the post URL slug. For example, `2026-05-07-my-new-post.md` is available at `/blog/2026-05-07-my-new-post`.

Required front matter:

```yaml
title: "Post title"
date: "2026-05-07"
description: "Short summary shown in lists and previews."
tags:
  - Java
  - AI
category: "Engineering"
cover: "/images/posts/example-cover.webp"
published: true
featured: false
```

Field notes:

- `published: false` hides the post from lists, detail pages, and static routes.
- If `cover` is empty, the site uses the first Markdown image in the post body.
- If the post body has no image, the site uses `/images/default-cover.jpg`.
- `description`, `tags`, and `category` are used for cards, filtering, and search text.
- `featured: true` places the post ahead of non-featured posts on the homepage.
- If fewer featured posts are available than the configured count, the homepage fills the remaining slots with the latest published posts.

Use `docs/templates/post-template.md` as a copyable starting point.

## Projects

Projects are maintained in `content/projects.json`. `content/projects.ts` is the typed page-facing export.

Add a project by appending a new object to the `projects` array:

```json
{
  "projects": [
    {
      "title": "Example Project",
      "slug": "example-project",
      "description": "Short project summary.",
      "longDescription": "Longer project explanation.",
      "disclosure": "public",
      "caseStudy": {
        "role": "Backend and AI application developer",
        "responsibilities": ["Owned the retrieval and answer pipeline."],
        "highlights": ["Combined hybrid retrieval with reranking."],
        "outcomes": ["Published a verifiable implementation."]
      },
      "stack": ["Next.js", "TypeScript"],
      "category": "Personal Site",
      "cover": "/images/projects/example-project.webp",
      "github": "https://github.com/klaybloom/example-project",
      "demo": "https://example.com",
      "date": "2026-05-07",
      "updated": "2026-05-07",
      "status": "building",
      "featured": true,
      "pinned": false
    }
  ]
}
```

Required project fields:

- `title`
- `slug`
- `description`
- `longDescription`
- `disclosure`
- `caseStudy.role`
- `caseStudy.responsibilities`
- `caseStudy.highlights`
- `caseStudy.outcomes`
- `stack`
- `category`
- `cover`
- `github`
- `demo`
- `date`
- `updated`
- `status`
- `featured`
- `pinned`

Valid `status` values:

```text
planning
building
launched
paused
archived
```

Field notes:

- `slug` becomes the detail page path: `/projects/{slug}`.
- `stack` powers the project filter.
- `featured: true` allows the project to appear on the homepage.
- `pinned: true` places a featured project ahead of non-pinned projects; projects in the same group are sorted by `updated`.
- Use `disclosure: "public"` for projects with public links and `disclosure: "limited"` for anonymized enterprise work.
- Limited projects show a disclosure notice and do not render source or demo links.
- Keep image paths under `public/images/projects/` and reference them as `/images/projects/file-name.webp`.

Use `docs/templates/project-template.ts` as a copyable starting point.

## Homepage Rules

The homepage uses these existing data helpers:

- Homepage projects: projects where `featured: true`, sorted by `pinned` and then `updated`.
- Homepage posts: featured published posts first, then the latest published posts until the configured count is reached.

## Profile And Site Info

Update personal and site-level content in these files:

- `content/profile.json`: name, title, bio, and profile links.
- `content/site.ts`: site name, metadata, URL, and top navigation.
- `content/skills.json`: skill groups.
- `content/highlights.ts`: highlight metrics.
- `content/experience.json`: experience timeline.

## Before Publishing

Run the complete local check:

```sh
npm run check
```

After pushing, wait for GitHub Pages Actions to complete and verify the deployed site:

```sh
curl -I https://klaybloom.github.io/
```
