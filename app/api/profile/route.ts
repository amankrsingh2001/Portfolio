import { portfolio } from "../../data/portfolio";

export function GET() {
  const { name, role, specialization, location, about, email, social, education, certifications } =
    portfolio;
  const current = portfolio.experience.find((job) => job.current);
  return Response.json({
    name,
    role,
    specialization,
    location,
    currently: current ? `${current.role} at ${current.organization}` : null,
    about,
    email,
    social,
    education,
    certifications: certifications.map(({ title, issuer }) => ({ title, issuer })),
  });
}
