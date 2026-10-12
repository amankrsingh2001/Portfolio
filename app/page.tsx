import Link from "next/link";
import { portfolio } from "./data/portfolio";
import { HeroArt } from "./components/hero-art";
import { HeroLight } from "./components/hero-light";
import { HeroTitle } from "./components/hero-title";
import { HeroBlackhole } from "./components/hero-blackhole";
import { HeroIntro } from "./components/hero-intro";
import { LogoMarquee } from "./components/logo-marquee";

export default function Home() {
  const current = portfolio.experience.find((job) => job.current);
  return (
    <>
      <section className="hero" id="top" aria-labelledby="hero-heading">
        <HeroBlackhole />
        <HeroLight />
        <div className="hero-copy">
          {current && (
            <p className="hero-status">
              <span className="dot" aria-hidden="true" />
              {current.role.split(" (")[0]} at {current.organization}
              <span className="muted"> · {portfolio.location}</span>
            </p>
          )}
          <HeroTitle />
          <HeroIntro />
          <div className="hero-actions">
            <Link className="button" href="/projects">
              See my work
            </Link>
            <Link className="button button-ghost" href="/resume">
              Résumé
            </Link>
            <span className="hero-social">
              <a href={portfolio.social.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </span>
          </div>
        </div>
        <HeroArt />
      </section>
      <LogoMarquee />
    </>
  );
}
