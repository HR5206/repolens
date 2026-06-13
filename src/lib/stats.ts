import type { RepoSummary } from "./types";

export interface LanguageStat {
    language: string;
    count: number;
    percentage: number;
}

export function computeLanguageStats(repos: RepoSummary[]): LanguageStat[] {
    const counts: Record<string, number> = {};
    for (const repo of repos)
    {
        if (repo.primaryLanguage === null) continue;
        counts[repo.primaryLanguage] = (counts[repo.primaryLanguage] ?? 0) + 1;
    }

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    if (total === 0) return [];

    return Object.entries(counts)
        .map(([language, count]) => ({
            language,
            count,
            percentage: Math.round((count / total) * 1000) / 10,
        }))
        .sort((a, b) => b.percentage - a.percentage);
}

export interface ActivityStats {
    activeCount: number;
    staleCount: number;
    mostRecentPush: string | null;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function computeActivityStats(
    repos: RepoSummary[],
    now: Date = new Date(),
) : ActivityStats {
    let activeCount = 0;
    let mostRecent: string | null = null;

    for (const repo of repos) {
        const pushed = new Date(repo.pushedAt);
        if (now.getTime() - pushed.getTime() <= NINETY_DAYS_MS){
            activeCount++;
        }
        if (mostRecent === null || repo.pushedAt > mostRecent)
        {
            mostRecent = repo.pushedAt;
        }
    }

    return {
        activeCount,
        staleCount: repos.length - activeCount,
        mostRecentPush: mostRecent,
    }
}

export interface DayActivity {
    date: string;
    count: number;
}

export function computeDailyActivity(
    events: { created_at: string }[],
    days = 91,
    now: Date = new Date(),
) : DayActivity[] {
    const counts: Record<string, number> = {};
    for (const event of events)
    {
        const day = event.created_at.slice(0, 10);
        counts[day] = (counts[day] ?? 0) + 1;
    }

    const result: DayActivity[] = [];
    for (let i = days - 1; i >= 0; i--)
    {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const date = d.toISOString().slice(0, 10);
        result.push({ date, count: counts[date] ?? 0});
    }
    return result;
}