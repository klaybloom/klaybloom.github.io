# 002 - Remove layout animation from admin sidebar

- **Status**: DONE
- **Commit**: 340ec1c5
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, admin sidebar class and state styling

## Problem

The admin sidebar collapse animates layout properties. Browser verification showed the sidebar width changes from `200px` to `48px`, while the main workspace padding changes from `232px` to `80px`, both under a 300ms transition.

`app/admin/page.tsx:2949` current:

```tsx
<aside
  className="fixed left-4 top-4 bottom-4 z-50 flex flex-col select-none transition-all duration-300"
  style={{
    width: sidebarCollapsed ? "48px" : "200px",
```

`app/admin/page.tsx:3067` current:

```tsx
<main
  className="min-h-screen p-6 transition-all duration-300"
  style={{ paddingLeft: sidebarCollapsed ? "80px" : "232px" }}
>
```

`transition-all` also makes future style changes animate accidentally.

## Target

Do not animate layout properties. Keep the interaction immediate and predictable. If visual feedback is still desired, limit transitions to compositor-friendly or paint-only properties.

Target pattern:

```tsx
<aside
  className="fixed left-4 top-4 bottom-4 z-50 flex flex-col select-none transition-[background-color,border-color,box-shadow] duration-200 ease-out"
  style={{
    width: sidebarCollapsed ? "48px" : "200px",
```

```tsx
<main
  className="min-h-screen p-6"
  style={{ paddingLeft: sidebarCollapsed ? "80px" : "232px" }}
>
```

Optional follow-up if the instant layout jump feels too abrupt:

```tsx
<div
  className="transition-opacity duration-150 ease-out"
  style={{ opacity: sidebarCollapsed ? 0 : 1 }}
>
  ...
</div>
```

Use CSS `ease-out` timing for UI responses: `cubic-bezier(0.23, 1, 0.32, 1)` if adding a custom CSS class; otherwise Tailwind `ease-out` is acceptable for this admin-only cleanup.

## Repo conventions to follow

- Admin page currently uses Tailwind utility classes and inline styles heavily; keep the change local to `app/admin/page.tsx`.
- Do not introduce shared CSS for this unless repeated admin sidebar classes become hard to read.
- Avoid new dependencies.

## Steps

1. In `app/admin/page.tsx`, replace the aside class `transition-all duration-300` with an explicit transition that does not include `width`, such as `transition-[background-color,border-color,box-shadow] duration-200 ease-out`.
2. Remove `transition-all duration-300` from the workspace `<main>` class. Keep `paddingLeft` state logic unchanged.
3. Check the collapse button itself. Its hover scale may remain, but if touching this area, prefer `transition-transform duration-150 ease-out` instead of bare `transition`.
4. Do not refactor the sidebar component or tab data in this plan.

## Boundaries

- Do NOT change admin tab behavior.
- Do NOT change `sidebarCollapsed` state shape.
- Do NOT change save/delete flows.
- Do NOT alter public site pages.

## Verification

- **Mechanical**: run `npm run lint`; no new errors.
- **Feel check**: run `npm run dev`, open `/admin`, click the collapse button, and confirm:
  - Sidebar width updates immediately.
  - Main workspace padding updates immediately.
  - No broad `transition-all` remains on the sidebar container or main workspace.
  - The page does not feel broken when toggling the sidebar repeatedly.
- **Done when**: computed transitions for the sidebar and main workspace no longer animate `all`, `width`, or `padding-left`.
