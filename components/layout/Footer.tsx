import Link from "next/link";
import type { NavItem } from "@/content/types";

type FooterProps = {
  nav: NavItem[];
};

export function Footer({ nav }: FooterProps) {
  return (
    <footer className="border-t border-notion-line">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-10">
        <span className="font-mono text-[12px] text-notion-faint">
          &copy; 2026 Klay&apos;s Studio
        </span>
        <div className="flex gap-6">
          {nav.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-notion-faint transition hover:text-notion-accent"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] text-notion-faint transition hover:text-notion-accent"
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
