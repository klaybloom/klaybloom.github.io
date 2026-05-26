"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

const STORAGE_KEY = "tahoe-mode";

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: Mode) {
  document
    .querySelector("[data-tahoe-preview]")
    ?.setAttribute("data-tahoe-mode", mode);
}

export function TahoeModeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    applyMode(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <button
      aria-label={mode === "light" ? "切换到夜间模式" : "切换到日间模式"}
      className={iconOnly ? "tahoe-mode-toggle is-icon-only" : "tahoe-mode-toggle"}
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      suppressHydrationWarning
      type="button"
    >
      <span aria-hidden>{mode === "light" ? "☀" : "☾"}</span>
      {iconOnly ? null : mode === "light" ? "日间" : "夜间"}
    </button>
  );
}
