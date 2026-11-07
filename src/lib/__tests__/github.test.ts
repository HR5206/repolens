import { afterEach, expect, test, vi } from "vitest";
import { getProfile, getRepos, getEvents, GitHubError } from "../github";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const response = (data: unknown) => ({ok: true, json: async () => data});
test("public fetch omits authorization when no token exists", async () => {
    vi.stubEnv("GITHUB_TOKEN", ""); const fetch = vi.fn().mockResolvedValue(response({login:"alice"})); vi.stubGlobal("fetch", fetch);
    await getProfile("alice"); expect(fetch.mock.calls[0]![1].headers.Authorization).toBeUndefined();
});
test("repositories paginate before filtering forks", async () => {
    const first = Array.from({length:100}, (_,i) => ({name:`r${i}`,fork:i===0}));
    const fetch = vi.fn().mockResolvedValueOnce(response(first)).mockResolvedValueOnce(response([{name:"last",fork:false}])); vi.stubGlobal("fetch", fetch);
    const repos = await getRepos("alice"); expect(repos).toHaveLength(100); expect(repos.at(-1)?.name).toBe("last"); expect(fetch.mock.calls[1]![0]).toContain("page=2");
});
test("events request 100 entries on all three pages", async () => {
    const fetch = vi.fn().mockResolvedValue(response([])); vi.stubGlobal("fetch", fetch); await getEvents("alice");
    expect(fetch).toHaveBeenCalledTimes(3); for (const [url] of fetch.mock.calls) expect(url).toContain("per_page=100");
});
test("GitHub errors preserve their status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok:false,status:404})); await expect(getProfile("missing")).rejects.toMatchObject({status:404,name:"GitHubError"} satisfies Partial<GitHubError>);
});
