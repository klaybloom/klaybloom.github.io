// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownPreview } from "../components/admin/MarkdownPreview";
import { ProductionAdminNotice } from "../components/admin/ProductionAdminNotice";

describe("MarkdownPreview", () => {
  it("renders raw HTML as text and removes dangerous URLs", () => {
    const { container } = render(
      <MarkdownPreview
        markdown={'<img src=x onerror="alert(1)">\n\n[bad](javascript:alert(1))\n\n[good](/blog/)'}
      />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("[onerror]")).not.toBeInTheDocument();
    expect(screen.getByText(/<img src=x onerror=/)).toBeInTheDocument();
    expect(screen.getByText("bad").closest("a")).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "good" })).toHaveAttribute("href", "/blog/");
  });

  it("allows http, https, mailto and site-relative links", () => {
    render(
      <MarkdownPreview
        markdown={[
          "[http](http://example.com)",
          "[https](https://example.com)",
          "[mail](mailto:hello@example.com)",
          "[site](/projects/)",
        ].join("\n\n")}
      />,
    );

    expect(screen.getByRole("link", { name: "http" })).toHaveAttribute("href", "http://example.com");
    expect(screen.getByRole("link", { name: "https" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByRole("link", { name: "mail" })).toHaveAttribute("href", "mailto:hello@example.com");
    expect(screen.getByRole("link", { name: "site" })).toHaveAttribute("href", "/projects/");
  });
});

describe("ProductionAdminNotice", () => {
  it("contains only local usage guidance, without GitHub credentials or editing controls", () => {
    render(<ProductionAdminNotice />);

    expect(screen.getByRole("heading", { name: "内容管理仅限本地使用" })).toBeInTheDocument();
    expect(screen.getByText(/npm run dev/)).toBeInTheDocument();
    expect(screen.queryByText(/PAT|访问令牌|GitHub 授权/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
