import type { AnchorHTMLAttributes } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  section: "home" | "projects" | "articles" | "about";
};

// Use native fragment navigation so repeated jumps and cross-page returns
// retain the browser's anchor positioning and history behavior.
export function HomeSectionLink({ section, ...props }: Props) {
  return <a href={`/#${section}`} {...props} />;
}
