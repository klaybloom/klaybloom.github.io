"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";
type Palette = "default" | "1" | "2" | "3" | "4";

const STORAGE_KEY = "tahoe-mode";
const PALETTE_STORAGE_KEY = "tahoe-palette";

const paletteOptions: Array<{ id: Palette; label: string; swatch: string }> = [
  { id: "default", label: "默认蓝", swatch: "palette-swatch-default" },
  { id: "1", label: "香香蓝", swatch: "palette-swatch-1" },
  { id: "2", label: "岩茶绿", swatch: "palette-swatch-2" },
  { id: "3", label: "海盐蓝", swatch: "palette-swatch-3" },
  { id: "4", label: "午夜蓝", swatch: "palette-swatch-4" },
];

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialPalette(): Palette {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
  return paletteOptions.some((palette) => palette.id === stored)
    ? (stored as Palette)
    : "default";
}

function applyTheme(mode: Mode, palette: Palette) {
  document.documentElement.setAttribute("data-tahoe-mode", mode);
  if (palette === "default") {
    document.documentElement.removeAttribute("data-tahoe-palette");
  } else {
    document.documentElement.setAttribute("data-tahoe-palette", palette);
  }

  const preview = document.querySelector("[data-tahoe-preview]");
  preview?.setAttribute("data-tahoe-mode", mode);
  if (palette === "default") {
    preview?.removeAttribute("data-palette");
  } else {
    preview?.setAttribute("data-palette", palette);
  }
}

export function TahoeModeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const [mode, setMode] = useState<Mode>("light");
  const [palette, setPalette] = useState<Palette>("default");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initialMode = getInitialMode();
    const initialPalette = getInitialPalette();
    applyTheme(initialMode, initialPalette);
    window.localStorage.setItem(STORAGE_KEY, initialMode);
    window.localStorage.setItem(PALETTE_STORAGE_KEY, initialPalette);
    const frame = window.requestAnimationFrame(() => {
      setMode(initialMode);
      setPalette(initialPalette);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function updateMode(nextMode: Mode) {
    setMode(nextMode);
    applyTheme(nextMode, palette);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  }

  function updatePalette(nextPalette: Palette) {
    setPalette(nextPalette);
    applyTheme(mode, nextPalette);
    window.localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
    setOpen(false);
  }

  const currentPalette = paletteOptions.find((option) => option.id === palette) ?? paletteOptions[0];

  return (
    <div className="tahoe-theme-picker">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="打开主题设置"
        className={iconOnly ? "tahoe-mode-toggle is-icon-only" : "tahoe-mode-toggle"}
        onClick={() => setOpen((current) => !current)}
        suppressHydrationWarning
        type="button"
      >
        <span aria-hidden>{mode === "light" ? "☀" : "☾"}</span>
        <span className={`tahoe-current-swatch ${currentPalette.swatch}`} aria-hidden />
        {iconOnly ? null : "主题"}
      </button>

      {open ? (
        <div className="tahoe-theme-menu" role="menu">
          <div className="tahoe-theme-menu-title">颜色主题</div>
          <div className="tahoe-palette-options">
            {paletteOptions.map((option) => (
              <button
                aria-checked={palette === option.id}
                className={`tahoe-palette-option${palette === option.id ? " is-active" : ""}`}
                key={option.id}
                onClick={() => updatePalette(option.id)}
                role="menuitemradio"
                type="button"
              >
                <span className={`tahoe-palette-swatch ${option.swatch}`} aria-hidden />
                <span>{option.label}</span>
                {palette === option.id ? <span className="tahoe-palette-check" aria-hidden>✓</span> : null}
              </button>
            ))}
          </div>

          <div className="tahoe-theme-menu-title">显示模式</div>
          <div className="tahoe-mode-options">
            {(["light", "dark"] as const).map((option) => (
              <button
                className={mode === option ? "is-active" : ""}
                key={option}
                onClick={() => updateMode(option)}
                type="button"
              >
                {option === "light" ? "日间" : "夜间"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
