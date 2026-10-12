import type { Metadata } from "next";
import Link from "next/link";
import { portfolio } from "../data/portfolio";
import { TerminalResume } from "./terminal-resume";

export const metadata: Metadata = { title: "Résumé" };

export default async function ResumePage({ searchParams }: PageProps<"/resume">) {
  const { view } = await searchParams;
  const terminal = view === "terminal";
  return (
    <section className="section resume" aria-labelledby="resume-heading">
      <h1 id="resume-heading" className="section-title">
        Résumé
      </h1>
      <div className="section-content">
        <div className="resume-actions">
          <nav className="resume-views" aria-label="Résumé view">
            <Link href="/resume" aria-current={terminal ? undefined : "page"}>
              PDF
            </Link>
            <Link href="/resume?view=terminal" aria-current={terminal ? "page" : undefined}>
              Terminal
            </Link>
          </nav>
          <a className="button" href={portfolio.resume} download>
            Download PDF
          </a>
          {terminal ? (
            <span className="resume-print-hint muted">Prints as a clean page, too.</span>
          ) : (
            <a
              className="button button-ghost"
              href={portfolio.resume}
              target="_blank"
              rel="noreferrer"
            >
              Open in a new tab
            </a>
          )}
        </div>
        {terminal ? (
          <TerminalResume />
        ) : (
          <>
            <div className="resume-frame">
              <iframe src={`${portfolio.resume}#view=FitH`} title={`${portfolio.name} — résumé`} />
            </div>
            <p className="resume-fallback muted">
              Can&apos;t see it? Some phones don&apos;t show PDFs inline —{" "}
              <a href={portfolio.resume} target="_blank" rel="noreferrer">
                open the PDF directly
              </a>
              .
            </p>
          </>
        )}
      </div>
    </section>
  );
}
