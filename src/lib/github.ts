import type { DevProfile, RepoSummary } from "./types";

const BASE = "https://api.github.com";

interface GitHubUserResponse {
    login: string;
    name: string | null;
    avatar_url: string;
    public_repos: number;
    followers: number;
    created_at: string;
}

export class GitHubError extends Error {
    constructor(
        public readonly status: number,
        path: string,
    ) {
        super(`GitHub API ${status}: ${path}`);
        this.name = "GitHubError";
    }
}

async function ghFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { Accept: "application/vnd.github+json",
            ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 300},
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
        throw new GitHubError(res.status, path);
    }
    return res.json() as Promise<T>;
}

export async function getProfile(username: string): Promise<DevProfile> {
    const raw = await ghFetch<GitHubUserResponse>(
        `/users/${encodeURIComponent(username)}`,
    );
    return {
        username: raw.login,
        name: raw.name,
        avatarUrl: raw.avatar_url,
        publicRepos: raw.public_repos,
        followers: raw.followers,
        createdAt: raw.created_at,
    };
}

interface GitHubRepoResponse {
    name: string;
    stargazers_count: number;
    language: string | null;
    pushed_at: string;
    fork: boolean;
}

export async function getRepos(username: string): Promise<RepoSummary[]> {
    const raw: GitHubRepoResponse[] = [];
    for (let page = 1; ; page++) {
        if (page > 50) throw new Error("This profile exceeds the 5,000 repository limit.");
        const batch = await ghFetch<GitHubRepoResponse[]>(
            `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&page=${page}`,
        );
        raw.push(...batch);
        if (batch.length < 100) break;
    }
    return raw
        .filter((r) => !r.fork)
        .map((r) => ({
            name: r.name,
            stars: r.stargazers_count,
            primaryLanguage: r.language,
            pushedAt: r.pushed_at,
            isFork: r.fork,
        }));
}

export interface GitHubEventResponse {
    type: string;
    created_at: string;
}

export async function getEvents(username: string): Promise<GitHubEventResponse[]> {
    const pages = await Promise.all(
        [1, 2, 3].map((page) => 
            ghFetch<GitHubEventResponse[]>(
                `/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
            ),
        ),
    );
    return pages.flat();
}