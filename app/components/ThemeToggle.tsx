"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    localStorage.setItem("ganttic-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    localStorage.setItem("ganttic-theme", "light");
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasDark = document.documentElement.classList.contains("dark");
    setIsDark(hasDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center opacity-40"
      >
        <Sun className="h-4 w-4 text-[var(--text-muted)]" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center transition-all duration-300 hover:border-[var(--copper)]/30 hover:shadow-sm hover:shadow-[var(--copper)]/5 active:scale-95"
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-[var(--copper)]" />
      ) : (
        <Sun className="h-4 w-4 text-[var(--copper)]" />
      )}
    </button>
  );
}
