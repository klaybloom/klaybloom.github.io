# Motion and interaction

The public site keeps motion deliberately small:

- `components/Interactions.tsx` adds `.visible` when `.animate-on-scroll` content enters the viewport.
- The same component adds a light header shadow after the page starts scrolling.
- `components/blog/TOCScrollActive.tsx` manages article anchor scrolling and respects `prefers-reduced-motion`.
- Shared Tahoe hover, color and opacity transitions live in `app/globals.css`.
- The admin toast uses a 180 ms opacity/translate entry animation. The admin sidebar changes width immediately and does not animate layout properties.

There is no custom cursor, click-particle renderer or magnetic hover engine. Reduced-motion mode disables movement-heavy animation while retaining useful color and focus feedback.
