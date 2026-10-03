"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** true only after hydration, so the server and first client render agree. */
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

type Labels = { toDark: string; toLight: string; generic: string };

const defaultLabels: Labels = {
  toDark: "Switch to dark theme",
  toLight: "Switch to light theme",
  generic: "Toggle colour theme",
};

/**
 * Sun/moon toggle. Icons swap with CSS (`dark:`), so they're right before hydration;
 * the aria-label needs the resolved theme and is filled in after mount.
 */
export default function ThemeToggle({ labels = defaultLabels, className = "" }: { labels?: Labels; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const label = mounted ? (isDark ? labels.toLight : labels.toDark) : labels.generic;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className={`group relative grid size-10 shrink-0 cursor-pointer place-items-center border border-line text-ink hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      {/* Moon (shown in light theme) */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-2 dark:hidden">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      {/* Sun (shown in dark theme) */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden size-[18px] fill-none stroke-current stroke-2 dark:block">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Tooltip */}
      <span
        role="presentation"
        className="pointer-events-none absolute top-full right-0 z-30 mt-2 hidden whitespace-nowrap border border-line bg-card px-2.5 py-1.5 text-[11px] font-medium text-ink shadow-md group-hover:block group-focus-visible:block"
      >
        {label}
      </span>
    </button>
  );
}
