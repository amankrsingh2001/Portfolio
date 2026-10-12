import type { Metadata } from "next";
import { portfolio } from "../data/portfolio";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <section className="section" aria-labelledby="privacy-heading">
      <h1 id="privacy-heading" className="section-title">
        Privacy
      </h1>
      <div className="section-content prose">
        <p>
          This site keeps simple visit statistics so I can see how people use it. It uses a
          first-party cookie to recognise a returning browser; nothing is shared with advertisers or
          sold.
        </p>
        <p>
          <strong>What&apos;s recorded:</strong> the pages you open and roughly how long you stay,
          the site that linked you here, your browser, operating system and device type, an
          approximate location (city or region, from your IP address), whether you view or download
          my résumé, and whether you copy or click my email or phone number. Terminal commands you
          run on this site are recorded too. Your IP address itself is not stored, only a one-way
          hash of it.
        </p>
        <p>
          <strong>What isn&apos;t:</strong> your name or email, unless you give them to me through
          the contact form or the terminal&apos;s <code>hello</code> command. Data is deleted after
          180 days.
        </p>
        <p>
          <strong>Opting out:</strong> if your browser sends Global Privacy Control, nothing is
          recorded. You can also open{" "}
          {/* A full page load on purpose: the opt-out is read when the page first loads. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/?notrack=1">this link</a> to stop tracking in this
          browser. To have your data deleted, email{" "}
          <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>.
        </p>
      </div>
    </section>
  );
}
