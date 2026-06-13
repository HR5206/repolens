export interface DevProfile {
    username: string;
    name: string | null;
    avatarUrl: string;
    publicRepos:  number;
    followers: number;
    createdAt: string;
}

export interface RepoSummary {
    name: string;
    stars: number;
    primaryLanguage: string | null;
    pushedAt: string;
    isFork: boolean;
}