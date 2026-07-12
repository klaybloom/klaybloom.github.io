# 001 - Respect reduced motion for page and article scrolling

- **Status**: DONE
- **Commit**: 340ec1c5
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, small CSS and client effect update

## Problem

Reduced motion currently disables transitions inside `[data-tahoe-preview]`, but page scrolling remains smooth because `html` owns the smooth scroll rule and the article TOC client component sets an inline smooth scroll style.

`app/globals.css:1230` current:

```css
@media (prefers-reduced-motion: reduce) {
  [data-tahoe-preview] *,
  [data-tahoe-preview] *::before,
  [data-tahoe-preview] *::after {
    animation: none !important;
    scroll-behavior: auto !important;
    transition: none !important;
  }
}

html {
  scroll-behavior: smooth;
}
```

`components/blog/TOCScrollActive.tsx:8` current:

```tsx
useEffect(() => {
  // Enable smooth scroll behavior globally on mount
  document.documentElement.style.scrollBehavior = "smooth";

  const headings = Array.from(document.querySelectorAll(".markdown-body h2, .markdown-body h3"));
  if (headings.length === 0) return;
```

Browser check showed `prefers-reduced-motion: reduce` was active, but `htmlScrollBehavior` and `document.documentElement.style.scrollBehavior` were still `smooth` on the article page.

## Target

Reduced-motion users should not get smooth scroll movement. Keep helpful opacity/color feedback where reasonable; do not globally remove every transition as the only accessibility response.

Target CSS:

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  [data-tahoe-preview] *,
  [data-tahoe-preview] *::before,
  [data-tahoe-preview] *::after {
    animation: none !important;
  }

  [data-tahoe-preview] .tahoe-nav-item,
  [data-tahoe-preview] .tahoe-mini-button,
  [data-tahoe-preview] .tahoe-button,
  [data-tahoe-preview] .tahoe-link-button,
  [data-tahoe-preview] .tahoe-segment,
  [data-tahoe-preview] .tahoe-project-card,
  [data-tahoe-preview] .tahoe-post-tile,
  [data-tahoe-preview] .tahoe-skill-card {
    transition-property: background-color, border-color, color, box-shadow;
  }
}
```

Target TOC behavior:

```tsx
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const previousScrollBehavior = document.documentElement.style.scrollBehavior;
document.documentElement.style.scrollBehavior = reduceMotion ? "auto" : "smooth";

return () => {
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
  window.removeEventListener("scroll", handleScroll);
};
```

## Repo conventions to follow

- Shared visual motion currently lives in `app/globals.css`, with Tahoe-specific styles scoped by `[data-tahoe-preview]`.
- The repo uses CSS transitions and plain React client effects, not Framer Motion or a motion library.
- Existing scroll-related code is in `components/blog/TOCScrollActive.tsx`; keep the fix there instead of adding a new hook.

## Steps

1. In `app/globals.css`, keep `html { scroll-behavior: smooth; }`, then add `html { scroll-behavior: auto; }` inside `@media (prefers-reduced-motion: reduce)`.
2. In the same media query, stop using `transition: none !important` for every Tahoe descendant. Remove movement-heavy transitions by narrowing transition properties for interactive Tahoe classes, while keeping color/background/border feedback.
3. In `components/blog/TOCScrollActive.tsx`, replace the unconditional `document.documentElement.style.scrollBehavior = "smooth";` with a `matchMedia("(prefers-reduced-motion: reduce)")` branch.
4. Preserve the previous inline `scrollBehavior` value and restore it in cleanup, instead of always setting an empty string.

## Boundaries

- Do NOT change article heading parsing or active heading selection.
- Do NOT add a motion library.
- Do NOT change site navigation labels or article markup.
- If `TOCScrollActive.tsx` no longer owns article scroll behavior, stop and report instead of moving the logic elsewhere.

## Verification

- **Mechanical**: run `npm run lint`; existing warnings may remain, but this change should introduce no new errors.
- **Feel check**: run `npm run dev`, open `/blog/2026-07-08-officecli-ai-agent-office/`, enable reduced motion in DevTools Rendering, and confirm:
  - `matchMedia("(prefers-reduced-motion: reduce)").matches` is `true`.
  - `getComputedStyle(document.documentElement).scrollBehavior` is `auto`.
  - `document.documentElement.style.scrollBehavior` is `auto` or empty, not `smooth`.
  - TOC links still update active state while scrolling.
- **Done when**: reduced-motion mode has no smooth scrolling, and normal mode keeps smooth anchor scrolling.
