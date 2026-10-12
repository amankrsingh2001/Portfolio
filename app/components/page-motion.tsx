"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Progressive enhancement: content stays visible when JS or motion is off. */
export function PageMotion() {
  // Lives in the layout, so it runs again for each page's content.
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (preference.matches) return;
        const animation = entry.target.animate([
          { opacity: 0, translate: "0 22px" },
          { opacity: 1, translate: "0 0" },
        ], {
          duration: 700,
          delay: (index % 3) * 70,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "backwards",
        });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".section-title, .prose, .project, .job, .system, .tree-head, .credentials, .contact-lead, .contact-list")
      .forEach((element) => observer.observe(element));
    const stopMotion = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stopMotion);
    };
  }, [pathname]);
  return null;
}
