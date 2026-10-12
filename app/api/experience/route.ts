import { portfolio } from "../../data/portfolio";

export function GET() {
  return Response.json({
    count: portfolio.experience.length,
    experience: portfolio.experience.map(({ role, organization, dates, current, highlights }) => ({
      role,
      organization,
      dates,
      current,
      highlights,
    })),
  });
}
