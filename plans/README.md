# Animation Plans

Plans generated from the July 12, 2026 motion audit and browser verification.

| Number | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Respect reduced motion for page and article scrolling | MEDIUM | DONE |
| 002 | Remove layout animation from admin sidebar | MEDIUM | DONE |
| 003 | Define admin toast motion explicitly | LOW | DONE |

Recommended execution order:

1. `001-respect-reduced-motion-scroll.md` because it fixes a verified accessibility issue on public article pages.
2. `002-remove-admin-layout-animation.md` because it removes layout-property animation from the admin workspace.
3. `003-define-admin-toast-motion.md` because it cleans up an undefined admin-only animation.

Dependencies:

- Plan 001 is independent.
- Plan 002 is independent.
- Plan 003 can be done before or after Plan 002. If both touch `app/admin/page.tsx`, apply them in one branch and run lint once.
