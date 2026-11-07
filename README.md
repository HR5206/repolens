# RepoLens

I built RepoLens to turn a GitHub username into a compact view of public repositories, primary languages, and recent activity. It uses Next.js server rendering and GitHub's REST API. The interface keeps the existing black-and-white style.

## Run locally

Use Node 24 LTS and npm:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the address printed by Next.js and search for a username. `GITHUB_TOKEN` is optional for local use; without it, GitHub's unauthenticated rate limit applies. For a public deployment, configure a minimally scoped token as a **server-side** environment variable. Never prefix it with `NEXT_PUBLIC_` or commit its value.

```sh
npm run verify
npm run typecheck
npm audit
```

## What the numbers mean

- Public repository count comes from the profile and includes forks. Repository rows, language counts, and active/stale counts exclude forks.
- Active means a push within 90 days. This is recency, not a measure of code quality or developer productivity.
- Languages are counted by each repository's primary language, not source lines or language bytes.
- The activity view shows up to 300 recent public events on a 91-day UTC grid. It is not GitHub's contributions graph. Empty cells do not prove inactivity.

Repository requests paginate in batches of 100, with an explicit 5,000-repository limit. Fetches have a ten-second timeout and a five-minute Next.js cache interval. The repository names link back to GitHub. Local recent searches tolerate unavailable or malformed browser storage.

## Code map

`src/lib/github.ts` handles API access; `stats.ts` contains pure aggregation functions. `src/app/u/[username]/page.tsx` renders the profile. Tests cover aggregation and mocked API contracts, including token omission, pagination, error statuses, and event page size.

## Deployment

The previously listed Vercel URL returned HTTP 404 during this audit. Reconnect this repository to Vercel with the Next.js preset, Node 24, `npm ci`, and `npm run build`. Add `GITHUB_TOKEN` in the project's environment settings, redeploy, and verify a real username, an unknown username, repository links, and the empty-state behavior before placing the new URL in GitHub About.

This app needs a Next.js server; static export is not appropriate for arbitrary usernames. Check the hosting provider's current usage limits before enabling a public deployment. Local tests mock GitHub; they do not prove a deployed token or external API is available.
