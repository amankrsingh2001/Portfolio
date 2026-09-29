"use client";

import { useSyncExternalStore } from "react";

type Choice = "system" | "light" | "dark";

// Keep in sync with the inline script in app/layout.tsx.
const storageKey = "aman-portfolio-theme";
const changeEvent = "portfolio-theme-change";
const darkQuery = "(prefers-color-scheme: dark)";

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "light" || value === "dark") return value;
  } catch {
    // Storage can be blocked; fall back to the system preference.
  }
  return "system";
}

function applyChoice(choice: Choice) {
  const theme =
    choice === "system"
      ? matchMedia(darkQuery).matches
        ? "dark"
        : "light"
      : choice;
  document.documentElement.dataset.theme = theme;
}

function subscribe(onChange: () => void) {
  const media = matchMedia(darkQuery);
  const onSystem = () => {
    if (readChoice() === "system") applyChoice("system");
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) return;
    applyChoice(readChoice());
    onChange();
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

const options: { value: Choice; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "System theme",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: "light",
    label: "Light theme",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark theme",
    icon: <path d="M20.7 14.2A9 9 0 0 1 9.8 3.3a9 9 0 1 0 10.9 10.9Z" />,
  },
];

export function ThemeSwitch() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system");

  function select(next: Choice) {
    try {
      if (next === "system") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, next);
    } catch {
      // The choice still applies for this visit.
    }
    const update = () => applyChoice(next);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) {
      document.startViewTransition(update);
    } else {
      update();
    }
    window.dispatchEvent(new Event(changeEvent));
  }

  return (
    <div className="theme-switch" role="group" aria-label="Color theme">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={choice === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => select(option.value)}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {option.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
