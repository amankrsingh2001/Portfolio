"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2000);
  }
  return (
    <>
      <button type="button" className="copy-button" onClick={copy}>
        {copied === "done" ? "Copied" : "Copy"}
        <span className="visually-hidden"> email address</span>
      </button>
      <span className="visually-hidden" role="status">
        {copied === "done"
          ? "Email copied."
          : copied === "failed"
            ? "Could not copy. Select the address to copy it."
            : ""}
      </span>
    </>
  );
}
