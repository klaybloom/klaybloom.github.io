# 003 - Define admin toast motion explicitly

- **Status**: DONE
- **Commit**: 340ec1c5
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 2 files, small CSS class and one JSX class update

## Problem

The admin toast uses `animate-slide-up`, but no matching keyframes or Tailwind animation token exists in the repo. It also uses `transition-all duration-300`, which is broad and longer than needed for a small toast.

`app/admin/page.tsx:2831` current:

```tsx
{alert && (
  <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl border shadow-lg z-50 flex items-center gap-3 text-sm transition-all duration-300 animate-slide-up ${
    alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
    alert.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
    "bg-blue-50 text-blue-800 border-blue-200"
  }`}>
```

Search confirmed only this usage:

```text
app/admin/page.tsx:2832: ... transition-all duration-300 animate-slide-up ...
```

## Target

Create a concrete toast entry animation that uses opacity and transform only. Keep it short and responsive.

Target CSS:

```css
@keyframes admin-toast-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-toast {
  animation: admin-toast-enter 180ms cubic-bezier(0.23, 1, 0.32, 1);
  will-change: opacity, transform;
}
```

Target JSX:

```tsx
<div className={`admin-toast fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 text-sm shadow-lg ${
  alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
  alert.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
  "bg-blue-50 text-blue-800 border-blue-200"
}`}>
```

Under reduced motion, the existing reduced-motion media query should remove animation.

## Repo conventions to follow

- Global custom classes and keyframes belong in `app/globals.css`.
- Admin page uses Tailwind for layout; keep the JSX class readable and local.
- Use the strong ease-out value from the animation audit rules: `cubic-bezier(0.23, 1, 0.32, 1)`.

## Steps

1. Add `@keyframes admin-toast-enter` and `.admin-toast` to `app/globals.css`.
2. Update the toast wrapper in `app/admin/page.tsx` to use `admin-toast`.
3. Remove `transition-all duration-300 animate-slide-up` from that toast wrapper.
4. Do not add exit animation; the current `alert &&` rendering removes the toast immediately, and exit animation would require state choreography outside this plan.

## Boundaries

- Do NOT change alert state timing or alert message content.
- Do NOT refactor admin page state.
- Do NOT add Tailwind config animation tokens unless this project already starts using Tailwind animation tokens elsewhere.

## Verification

- **Mechanical**: run `npm run lint`; no new errors.
- **Feel check**: run `npm run dev`, open `/admin`, trigger an action that shows a toast, and confirm:
  - Toast enters with a short upward motion and fade.
  - No `animate-slide-up` class remains.
  - No `transition-all` is used on the toast.
  - In reduced-motion mode, the toast does not move.
- **Done when**: toast motion is defined in CSS, uses only opacity/transform, and has a 180ms ease-out entrance.
