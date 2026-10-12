import { portfolio } from "../../data/portfolio";

// Live GitHub stats, fetched server-side and cached for an hour so visitors never
// hit GitHub's unauthenticated rate limit.

const user = new URL(portfolio.social.github).pathname.replace(/\//g, "");
const api = (path: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "aman-portfolio" },
    next: { revalidate: 3600 },
  });

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
};

export async function GET() {
  try {
    const [profileRes, reposRes] = await Promise.all([
      api(`/users/${user}`),
      api(`/users/${user}/repos?per_page=100&sort=pushed`),
    ]);
    if (!profileRes.ok || !reposRes.ok) {
      return Response.json(
        { error: "GitHub is unavailable right now", status: profileRes.status },
        { status: 502 },
      );
    }
    const profile = await profileRes.json();
    const repos = ((await reposRes.json()) as Repo[]).filter((r) => !r.fork);
    const languages: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) languages[repo.language] = (languages[repo.language] ?? 0) + 1;
    }
    return Response.json({
      user,
      url: profile.html_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      memberSince: profile.created_at?.slice(0, 4),
      topLanguages: Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([language, repos]) => ({ language, repos })),
      recentlyPushed: repos.slice(0, 3).map((r) => ({
        name: r.name,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at.slice(0, 10),
      })),
    });
  } catch {
    return Response.json({ error: "Could not reach GitHub" }, { status: 502 });
  }
}
