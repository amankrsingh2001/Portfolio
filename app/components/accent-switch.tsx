"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { accents, accentStorageKey, defaultAccent, isAccent, type Accent } from "../data/accents";

const changeEvent = "portfolio-accent-change";

function readAccent(): Accent {
  const value = document.documentElement.dataset.accent;
  return isAccent(value) ? value : defaultAccent;
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== accentStorageKey && event.key !== null) return;
    document.documentElement.dataset.accent = isAccent(event.newValue) ? event.newValue : defaultAccent;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function AccentSwitch() {
  const choice = useSyncExternalStore(subscribe, readAccent, () => defaultAccent);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const selected = accents.find((accent) => accent.id === choice)!;

  useEffect(() => {
    if (!open) return;
    // Wait until the opening styles make the menu visible before moving focus.
    const frame = requestAnimationFrame(() => {
      root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    });
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);

  function select(next: Accent) {
    try {
      localStorage.setItem(accentStorageKey, next);
    } catch {
      // The palette still works when browser storage is unavailable.
    }
    const update = () => {
      document.documentElement.dataset.accent = next;
      window.dispatchEvent(new Event(changeEvent));
    };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && document.startViewTransition) {
      document.startViewTransition(update);
    } else update();
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      className="accent-picker"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        className="accent-trigger"
        type="button"
        ref={trigger}
        aria-label={`Change accent color, current: ${selected.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="accent-swatch accent-current" aria-hidden="true" />
        <span className="accent-label">Accent</span>
        <svg className="accent-chevron" data-open={open} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="accent-panel" id={panelId} data-open={open} inert={!open} aria-hidden={!open}>
        <p className="accent-panel-title">Make it yours <span>Choose an accent</span></p>
        <div role="menu" aria-label="Accent colors">
          {accents.map((accent, index) => (
            <button
              key={accent.id}
              type="button"
              role="menuitemradio"
              aria-checked={choice === accent.id}
              tabIndex={choice === accent.id ? 0 : -1}
              onClick={() => select(accent.id)}
              onKeyDown={(event) => {
                let next: number | undefined;
                if (event.key === "ArrowDown") next = (index + 1) % accents.length;
                if (event.key === "ArrowUp") next = (index - 1 + accents.length) % accents.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = accents.length - 1;
                if (next !== undefined) {
                  event.preventDefault();
                  const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
                  buttons?.[next]?.focus();
                }
              }}
            >
              <span className="accent-swatch" style={{ background: accent.color }} aria-hidden="true" />
              {accent.name}
              <span className="accent-check" aria-hidden="true">{choice === accent.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
