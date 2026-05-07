import Link from "next/link";
import type { NavItem } from "@/content/types";

type FooterProps = {
  nav: NavItem[];
};

export function Footer({ nav }: FooterProps) {
  return (
    <footer className="border-t border-notion-line/70 bg-white/35">
      <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-5 py-8 text-[13px] text-notion-faint sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 klay</p>
        <div className="flex flex-wrap gap-1">
          {nav.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </a>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
