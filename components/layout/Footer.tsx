import Link from "next/link";
import type { NavItem } from "@/content/types";

type FooterProps = {
  nav: NavItem[];
};

export function Footer({ nav }: FooterProps) {
  return (
    <footer className="relative z-10 mx-auto max-w-[1080px] px-4 pb-12 pt-8 sm:px-6">
      <div className="tahoe-contact-bar flex flex-col items-center gap-3 px-5 py-5 sm:flex-row sm:justify-between">
        <span className="text-[12px] font-semibold text-[color:var(--tahoe-faint)]">
          &copy; 2026 Klay&apos;s Studio
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {nav.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-[12px] font-medium text-[color:var(--tahoe-faint)] transition hover:text-[color:var(--tahoe-text)]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[12px] font-medium text-[color:var(--tahoe-faint)] transition hover:text-[color:var(--tahoe-text)]"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="/rss.xml"
            className="text-[12px] font-medium text-[color:var(--tahoe-faint)] transition hover:text-[color:var(--tahoe-text)]"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
