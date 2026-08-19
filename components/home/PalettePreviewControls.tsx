"use client";

import Link from "next/link";
import { useEffect } from "react";

const palettes = [
  { id: "1", name: "香香蓝", swatchClass: "palette-preview-swatch-1" },
  { id: "2", name: "岩茶绿", swatchClass: "palette-preview-swatch-2" },
  { id: "3", name: "海盐蓝", swatchClass: "palette-preview-swatch-3" },
  { id: "4", name: "午夜蓝", swatchClass: "palette-preview-swatch-4" },
];

const paletteIds = new Set(palettes.map((palette) => palette.id));

export function PalettePreviewControls() {
  useEffect(() => {
    const palette = new URLSearchParams(window.location.search).get("palette");
    if (!palette || !paletteIds.has(palette)) return;

    document.querySelector("main[data-tahoe-preview]")?.setAttribute("data-palette", palette);
    const controls = document.querySelector<HTMLElement>("[data-palette-preview-controls]");
    controls?.setAttribute("data-visible", "true");
    controls?.querySelectorAll<HTMLElement>(".palette-preview-option").forEach((option) => {
      option.classList.toggle("is-active", option.getAttribute("href") === `/?palette=${palette}`);
    });
  }, []);

  return (
    <nav
      className="palette-preview-controls"
      data-palette-preview-controls
      aria-label="个人 IP 配色预览"
    >
      <span className="palette-preview-label">配色预览</span>
      {palettes.map((palette) => (
        <a
          className="palette-preview-option"
          href={`/?palette=${palette.id}`}
          key={palette.id}
        >
          <span className={`palette-preview-swatch ${palette.swatchClass}`} aria-hidden />
          {palette.name}
        </a>
      ))}
      <Link className="palette-preview-exit" href="/">
        退出预览
      </Link>
    </nav>
  );
}
