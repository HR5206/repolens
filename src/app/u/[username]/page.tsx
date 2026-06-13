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

export default async function UserPage({ params }: PageProps) {
    const { username } = await params;
    let profile: DevProfile, repos: RepoSummary[], events: GitHubEventResponse[];
    
    try {
        [profile, repos, events] = await Promise.all([
            getProfile(username),
            getRepos(username),
            getEvents(username),
        ]);
    } catch (err) {
        if (err instanceof GitHubError && err.status === 404) {
            notFound();
        }
        throw err;
    }

    const languageStats = computeLanguageStats(repos);
    const activity = computeActivityStats(repos);
    const dailyActivity = computeDailyActivity(events);

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-16">
            <div className="mx-auto max-w-3xl p-8">
                {/* Navigation */}
                <Link 
                    href="/" 
                    className="inline-block mb-10 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                    ← Search 
                </Link>
                <header className="flex items-center gap-6 border-b border-white/30 pb-8">
                    <img 
                        src={profile.avatarUrl}
                        alt={`${profile.username}'s avatar`}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-white" // Grayscale REMOVED
                    />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-mono uppercase tracking-tighter">
                            {profile.name ?? profile.username}
                        </h1>
                        <p className="text-white/50 font-mono text-sm tracking-widest mt-1">
                            @{profile.username}
                        </p>
                    </div>
                </header>

                <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Followers", value: profile.followers },
                        { label: "Public Repos", value: profile.publicRepos },
                        { label: "Active", value: activity.activeCount },
                        { label: "Stale", value: activity.staleCount },
                    ].map((stat) => (
                        <div key={stat.label} className="border border-white/30 p-4 flex flex-col justify-between bg-black">
                            <dt className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/60 mb-3">
                                {stat.label}
                            </dt>
                            <dd className="text-3xl font-mono">{stat.value}</dd>
                        </div>
                    ))}
                </dl>

                <section className="mt-12">
                    <h2 className="text-xl font-mono uppercase tracking-tighter mb-4 border-b border-white pb-2">
                        Repositories
                    </h2>
                    <ul className="space-y-4">
                        {repos.map((repo) => (
                            <li 
                                key={repo.name} 
                                className="group border border-white/50 p-4 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-mono text-lg font-bold uppercase truncate group-hover:text-black">
                                        {repo.name}
                                    </span>
                                    <span className="text-xs font-mono text-white/60 group-hover:text-black/80 flex gap-3">
                                        <span>★ {repo.stars}</span>
                                        {repo.primaryLanguage && (
                                            <span> {repo.primaryLanguage.toUpperCase()}</span>
                                        )}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-12 border border-white/50 p-6">
                    <h2 className="text-lg font-mono uppercase tracking-tighter mb-6 text-white/80">
                        Language Stats
                    </h2>
                    <div>
                        <LanguageBar stats={languageStats} />
                    </div>
                </section>

                <section className="mt-8 border border-white/50 p-6">
                    <h2 className="text-lg font-mono uppercase tracking-tighter mb-6 text-white/80">
                        Activity Matrix
                    </h2>
                    <div>
                        <HeatMap days={dailyActivity} />
                    </div>
                </section>
            </div>
        </main>
    );
}