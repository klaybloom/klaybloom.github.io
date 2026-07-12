# Apple Principles Web Refactor Plan

## Goal

Use the current Tahoe direction as the official visual system, but translate Apple design principles for the web: content first, clear hierarchy, restrained controls, accessible motion, and predictable reading.

This plan does not change post content, project data, admin save logic, RSS, sitemap, routing, or deployment.

## Direction

- Keep `data-tahoe-preview` and `data-tahoe-mode="light|dark"` as the formal theme system.
- Stop developing the old `data-theme="glass"` direction for public pages.
- Treat Liquid Glass as a control-layer style, not a whole-page material.
- Keep article reading stable and high contrast.
- Use Apple-like discipline rather than macOS window imitation.

## Tasks

### Task 1: Theme Boundary

- Remove `glass` handling from the root `themeInitScript`.
- Keep Tahoe mode localStorage separate from the legacy `theme` key.
- Remove or isolate stale `[data-theme="glass"]` CSS that can affect public pages.
- Keep `/theme-preview` as a historical preview page unless it is explicitly deleted later.

### Task 2: Web Liquid Glass Rules

- Keep glass for Header, mode toggle, search, filters, back links, TOC, and small floating navigation.
- Use high-opacity content surfaces for hero content, article bodies, cards, and timeline blocks.
- Add non-blur fallback styles for browsers without `backdrop-filter`.
- Reduce blur, fixed background, and shadow cost on mobile.

### Task 3: Reading Experience

- Make article pages feel like readable content, not a glass panel demo.
- Keep article width around the current readable range.
- Improve Chinese long-form rhythm through paragraph spacing, heading spacing, quotes, tables, and code blocks.
- Reduce cover image hover motion on article pages.
- Make TOC usable without relying only on hover.

### Task 4: Homepage and Brand

- Remove macOS traffic-light dots from the hero.
- Make the hero a clear content section instead of a simulated app window.
- Keep the status panel, but make it a stable content surface.
- Keep brand identity in the writing, projects, and structure rather than window chrome.

### Task 5: Navigation and Interaction

- Keep the floating Header.
- Keep primary navigation concise: Blog, Project, RSS, and theme mode.
- Move GitHub and Email to Footer or homepage contact areas.
- Remove custom cursor, click ripple, and click particles.
- Keep restrained hover and scroll reveal behavior.
- Respect `prefers-reduced-motion`.

### Task 6: Cards and Project Media

- Make article cards more content-list oriented.
- Keep tags and status labels visually secondary.
- Lower the visual weight of abstract gradient project art.
- Prefer real project screenshots when available; otherwise use a quiet placeholder.

### Task 7: Accessibility and Verification

- Ensure focus-visible styles are clear on links, buttons, filters, TOC, and mode toggle.
- Ensure icon-only buttons have labels.
- Ensure filter selected states are visible and semantic enough.
- Check light and dark contrast for body text, tags, buttons, and links.
- Run `npm run lint` and `npm run build`.
- Check whether `next-env.d.ts` changed only because of build output.

## Acceptance Criteria

- Public pages use Tahoe as the only active design direction.
- Legacy glass state in localStorage does not visually switch public pages back to the old style.
- Article pages are more readable and less decorative.
- Header and controls retain the Apple-inspired glass feel.
- Motion no longer distracts from reading.
- Blog/project/admin functionality still works.
- Lint and build pass.
