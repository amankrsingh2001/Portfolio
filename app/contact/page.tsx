import type { Metadata } from "next";
import { CopyEmail } from "../components/interactions";
import { portfolio } from "../data/portfolio";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-heading">
      <h1 id="contact-heading" className="section-title">
        Contact
      </h1>
      <div className="section-content">
        <p className="contact-lead">
          Building something that needs a solid backend? I&apos;d like to hear about it.
        </p>
        <ul className="contact-list">
          <li>
            <span className="label">Email</span>
            <span className="contact-value">
              <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
              <CopyEmail email={portfolio.email} />
            </span>
          </li>
          <li>
            <span className="label">Phone</span>
            <a href={portfolio.phone.href}>{portfolio.phone.label}</a>
          </li>
          <li>
            <span className="label">GitHub</span>
            <a href={portfolio.social.github} target="_blank" rel="noreferrer">
              {portfolio.social.github.replace("https://", "")}
            </a>
          </li>
          <li>
            <span className="label">LinkedIn</span>
            <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
              {portfolio.social.linkedin.replace("https://www.", "").replace(/\/$/, "")}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
