type IconName = "github" | "sun" | "moon" | "book" | "code" | "pencil";

export function BannerIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "github" && <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.5-.5-2 3-.4 6-1.5 6-6a5 5 0 0 0-1.5-3.5c.2-1 .2-2-.1-3-1.4-.1-2.5.7-3.4 1.3a12 12 0 0 0-7 0C7.5 4.2 6.4 3.4 5 3.5c-.3 1-.3 2-.1 3A5 5 0 0 0 3.5 10c0 4.5 3 5.6 6 6-.6.5-.5 1-.5 2v4" />}
      {name === "sun" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
      {name === "moon" && <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />}
      {name === "book" && <path d="M5 5h5a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H5zM13 8a3 3 0 0 1 3-3h4v12h-4a3 3 0 0 0-3 3" />}
      {name === "code" && <path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 20" />}
      {name === "pencil" && <path d="M5 19h14M7 15l1-5 9-8 4 4-9 8z" />}
    </svg>
  );
}
