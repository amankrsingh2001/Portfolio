import type { Metadata } from "next";
import { portfolio } from "../data/portfolio";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <h1 id="about-heading" className="section-title">
        About
      </h1>
      <div className="section-content prose">
        <p>{portfolio.about}</p>
        <p>{portfolio.approach}</p>
      </div>
    </section>
  );
}
