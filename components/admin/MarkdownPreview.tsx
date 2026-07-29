"use client";

import ReactMarkdown, { type UrlTransform } from "react-markdown";

const SAFE_ABSOLUTE_URL = /^(https?:|mailto:)/i;

const safeUrlTransform: UrlTransform = (url) => {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (SAFE_ABSOLUTE_URL.test(url)) return url;
  return "";
};

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      urlTransform={safeUrlTransform}
      components={{
        a: ({ children, href, node: _node, ...props }) => (
          <a {...props} href={href || undefined} rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
