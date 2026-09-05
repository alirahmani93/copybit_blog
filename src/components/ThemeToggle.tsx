"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";
import { track } from "@/lib/analytics";

type Theme = "light" | "dark";

/**
 * Theme switch. The initial value is stamped on <html> pre-paint by the inline
 * script in the root layout, so this component only ever reads what is already
 * there — there is no flash and no server/client mismatch.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — the choice just does not persist */
    }
    setTheme(next);
    track("theme-toggle", { theme: next });
  }

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
