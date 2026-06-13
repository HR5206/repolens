import { notFound } from "next/navigation";
import { getProfile, getRepos, getEvents, GitHubError, GitHubEventResponse } from "@/lib/github";
import { DevProfile, RepoSummary } from "@/lib/types";
import { computeLanguageStats, computeActivityStats, computeDailyActivity } from "@/lib/stats";
import { LanguageBar } from "./LanguageBar";
import { HeatMap } from "@/components/HeatMap";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const profile = await getProfile(username);
    const displayName = profile.name ?? profile.username;
    return {
      title: displayName,   
      description: `${displayName} has ${profile.publicRepos} public repos and ${profile.followers} followers on GitHub.`,
      openGraph: {
        title: `${displayName} · RepoLens`,
        description: `Explore ${displayName}'s GitHub activity, language breakdown, and repositories.`,
        images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: `${displayName}'s avatar` }],
      },
      twitter: {
        card: "summary",
        title: `${displayName} · RepoLens`,
        images: [profile.avatarUrl],
      },
    };
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) {
      return { title: "User not found" };
    }
    return { title: username };   
  }
}


interface PageProps {
    params: Promise<{ username: string}>;
}

export default async function UserPage({ params } : PageProps) {
    const { username } = await params;
    let profile: DevProfile, repos : RepoSummary[], events: GitHubEventResponse[];
    try {
        [ profile, repos, events]  = await Promise.all([
            getProfile(username),
            getRepos(username),
            getEvents(username),
        ])
    } catch (err) {
        if (err instanceof GitHubError && err.status ===404) {
            notFound();
        }
        throw err;
    }
    const languageStats = computeLanguageStats(repos);
    const activity = computeActivityStats(repos);
    const dailyActivity = computeDailyActivity(events);
    return (
        <main className="mx-auto max-w-2xl p-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-black">← Search</Link>
            <div className="flex items-center gap-4">
                <img 
                    src={profile.avatarUrl}
                    alt={`${profile.username}'s avatar`}
                    width={80}
                    height={80}
                    className="rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">
                        {profile.name ?? profile.username}
                    </h1>
                    <p className="text-gray-500">@{profile.username}</p>
                </div>
            </div>

            <dl className="mt-6 flex gap-8">
                <div>
                    <dt className="text-sm text-gray-500">Followers</dt>
                    <dd className="text-xl font-semibold">{profile.followers}</dd>
                </div>
                <div>
                    <dt className="text-sm text-gray-500">Public repos</dt>
                    <dd className="text-xl font-semibold">{profile.publicRepos}</dd>
                </div>
            </dl>
            <ul className="mt-8 space-y-2">
                {repos.map((repo) => (
                    <li key={repo.name} className="rounded border p-3">
                        <span className="font-medium">{repo.name}</span>
                        <span className="ml-3 text-sm text-gray-500">
                            ⭐ {repo.stars} · {repo.primaryLanguage ?? "—"}
                        </span>
                    </li>
                ))}
            </ul>
            <LanguageBar stats={languageStats} />
            <dl className="mt-6 flex gap-8">
                <div>
                    <dt className="text-sm text-gray-500">Active Repos</dt>
                    <dd className="text-xl font-semibold">{activity.activeCount}</dd>
                </div>
                <div>
                    <dt className="text-sm text-gray-500">Stale Repos</dt>
                    <dd className="text-xl font-semibold">{activity.staleCount}</dd>
                </div>
            </dl>
            <HeatMap days={dailyActivity} />
        </main>
    );
}