import { portfolio } from "../data/portfolio";

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-heading">
      <h2 id="experience-heading" className="section-title">
        Experience
      </h2>
      <div className="section-content">
        <ol className="timeline">
          {portfolio.experience.map((job) => (
            <li key={job.organization} className="job">
              <p className="job-dates">
                {job.dates}
                {job.current && <span className="badge">Current</span>}
              </p>
              <div>
                <h3>
                  {job.role}
                  <span className="job-org"> · {job.organization}</span>
                </h3>
                <p className="job-summary">{job.summary}</p>
                <ul className="job-highlights">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="credentials">
          <div>
            <p className="label">Education · {portfolio.education.dates}</p>
            <p className="credential-title">{portfolio.education.institution}</p>
            <p className="muted">{portfolio.education.degree}</p>
          </div>
          {portfolio.certifications.map((certificate) => (
            <div key={certificate.title}>
              <p className="label">Certification · {certificate.issuer}</p>
              <p className="credential-title">{certificate.title}</p>
              <a
                className="inline-link"
                href={certificate.url}
                target="_blank"
                rel="noreferrer"
              >
                View certificate
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
