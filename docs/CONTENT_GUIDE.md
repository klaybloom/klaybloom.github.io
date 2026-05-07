# Content Guide

This site is a static Next.js site. Content is maintained through Markdown files and TypeScript configuration, without a CMS, database, or generation script.

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
```

Recommended front matter:

```yaml
description: "Short summary shown in lists and previews."
tags:
  - Java
  - AI
category: "Engineering"
cover: "/images/posts/example-cover.jpg"
published: true
featured: false
```

Field notes:

- `published: false` hides the post from lists, detail pages, and static routes.
- If `cover` is empty, the site uses the first Markdown image in the post body.
- If the post body has no image, the site uses `/images/default-cover.jpg`.
- `description`, `tags`, and `category` are used for cards, filtering, and search text.
- `featured` is parsed but does not currently control homepage placement.

Use `docs/templates/post-template.md` as a copyable starting point.

## Projects

Projects are maintained in `content/projects.ts`.

Add a project by appending a new object to the exported `projects` array:

```ts
export const projects: Project[] = [
  {
    title: "Example Project",
    slug: "example-project",
    description: "Short project summary.",
    longDescription: "Longer project explanation.",
    stack: ["Next.js", "TypeScript"],
    category: "Personal Site",
    cover: "/images/projects/example-project.png",
    github: "https://github.com/klaybloom/example-project",
    demo: "https://example.com",
    date: "2026-05-07",
    updated: "2026-05-07",
    status: "building",
    featured: true,
    pinned: false
  }
];
```

Required project fields:

- `title`
- `slug`
- `description`
- `longDescription`
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
- `pinned` is stored in the content model for future display rules.
- Keep image paths under `public/images/projects/` and reference them as `/images/projects/file-name.png`.

Use `docs/templates/project-template.ts` as a copyable starting point.

## Homepage Rules

The homepage uses these existing data helpers:

- Latest projects: newest 3 projects where `featured: true`, sorted by `date` descending.
- Latest posts: newest 3 published posts, sorted by `date` descending.

## Profile And Site Info

Update personal and site-level content in these files:

- `content/profile.ts`: name, title, bio, and profile links.
- `content/site.ts`: site name, metadata, URL, and top navigation.
- `content/skills.ts`: skill groups.
- `content/highlights.ts`: highlight metrics.
- `content/experience.ts`: experience timeline.

## Before Publishing

Run these checks locally:

```sh
npm run build
```

Optional content sanity check:

```sh
rg -n --hidden "[s]hifangxu|师方[旭]" . -g '!node_modules/**' -g '!.git/**' -g '!.next/**' -g '!out/**'
```

After pushing, wait for GitHub Pages Actions to complete and verify the deployed site:

```sh
curl -I https://klaybloom.github.io/
```
