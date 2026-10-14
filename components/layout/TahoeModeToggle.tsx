"use client";

import { useEffect, useState } from "react";
import { BannerIcon } from "./BannerIcon";

type Mode = "light" | "dark";

const STORAGE_KEY = "tahoe-mode";
function getInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: Mode) {
  document.documentElement.setAttribute("data-tahoe-mode", mode);
  document.documentElement.removeAttribute("data-tahoe-palette");
  const preview = document.querySelector("[data-tahoe-preview]");
  preview?.setAttribute("data-tahoe-mode", mode);
  preview?.removeAttribute("data-palette");
}

export function TahoeModeToggle({ iconOnly = false, direct = false }: { iconOnly?: boolean; direct?: boolean }) {
  const [mode, setMode] = useState<Mode>("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initialMode = getInitialMode();
    applyTheme(initialMode);
    window.localStorage.setItem(STORAGE_KEY, initialMode);
    window.localStorage.removeItem("tahoe-palette");
    const frame = window.requestAnimationFrame(() => {
      setMode(initialMode);
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
    applyTheme(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  }

  if (direct) {
    return (
      <button className="fy-appearance-button" type="button" aria-label={mode === "light" ? "切换深色模式" : "切换日间模式"} aria-pressed={mode === "dark"} onClick={() => updateMode(mode === "light" ? "dark" : "light")}>
        <BannerIcon name={mode === "light" ? "sun" : "moon"} />
      </button>
    );
  }

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
        <span className="tahoe-current-swatch palette-swatch-default" aria-hidden />
        {iconOnly ? null : "主题"}
      </button>

      {open ? (
        <div className="tahoe-theme-menu" role="menu" aria-label="方圆暖墨显示模式">
          <div className="tahoe-theme-menu-title">方圆暖墨</div>
          <div className="tahoe-mode-options">
            {(["light", "dark"] as const).map((option) => (
              <button
                role="menuitemradio"
                aria-checked={mode === option}
                className={mode === option ? "is-active" : ""}
                key={option}
                onClick={() => updateMode(option)}
                type="button"
              >
                {option === "light" ? "日间" : "深色"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
