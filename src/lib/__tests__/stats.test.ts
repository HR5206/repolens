import { describe, it, expect } from "vitest";
import {
    computeLanguageStats,
    computeActivityStats,
    computeDailyActivity,
} from "@/lib/stats";
import type { RepoSummary } from "@/lib/types";

function makeRepo(overrides: Partial<RepoSummary> = {}): RepoSummary {
    return {
        name: "repo",
        stars: 0,
        primaryLanguage: "TypeScript",
        pushedAt: "2026-01-01T00:00:00Z",
        isFork: false,
        ...overrides,
    }
}

describe("computeLanguageStats", () => {
  it("returns empty array for no repos", () => {
    expect(computeLanguageStats([])).toEqual([]);
  });

  it("returns empty array when all repos have null language", () => {
    const repos = [makeRepo({ primaryLanguage: null })];
    expect(computeLanguageStats(repos)).toEqual([]);
  });

  it("counts languages correctly", () => {
    const repos = [
      makeRepo({ primaryLanguage: "TypeScript" }),
      makeRepo({ primaryLanguage: "TypeScript" }),
      makeRepo({ primaryLanguage: "Python" }),
    ];
    const result = computeLanguageStats(repos);
    expect(result[0]?.language).toBe("TypeScript");
    expect(result[0]?.count).toBe(2);
    expect(result[1]?.language).toBe("Python");
    expect(result[1]?.count).toBe(1);
  });

  it("percentages sum to 100 (within floating point tolerance)", () => {
    const repos = Array.from({ length: 7 }, (_, i) =>
      makeRepo({ primaryLanguage: `Lang${i}` }),
    );
    const result = computeLanguageStats(repos);
    const sum = result.reduce((acc, s) => acc + s.percentage, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it("sorts by percentage descending", () => {
    const repos = [
      makeRepo({ primaryLanguage: "Go" }),
      makeRepo({ primaryLanguage: "TypeScript" }),
      makeRepo({ primaryLanguage: "TypeScript" }),
    ];
    const result = computeLanguageStats(repos);
    expect(result[0]?.language).toBe("TypeScript");
  });
});

describe("computeActivityStats", () => {
  const NOW = new Date("2026-06-12T12:00:00Z");

  it("returns zeros for empty repos", () => {
    const result = computeActivityStats([], NOW);
    expect(result).toEqual({ activeCount: 0, staleCount: 0, mostRecentPush: null });
  });

  it("classifies a repo pushed today as active", () => {
    const repos = [makeRepo({ pushedAt: "2026-06-12T00:00:00Z" })];
    const result = computeActivityStats(repos, NOW);
    expect(result.activeCount).toBe(1);
    expect(result.staleCount).toBe(0);
  });

  it("classifies a repo pushed 91 days ago as stale", () => {
    const repos = [makeRepo({ pushedAt: "2026-03-13T00:00:00Z" })]; // 91 days before June 12
    const result = computeActivityStats(repos, NOW);
    expect(result.activeCount).toBe(0);
    expect(result.staleCount).toBe(1);
  });

  it("tracks the most recent push across multiple repos", () => {
    const repos = [
      makeRepo({ pushedAt: "2026-03-01T00:00:00Z" }),
      makeRepo({ pushedAt: "2026-06-01T00:00:00Z" }),
      makeRepo({ pushedAt: "2026-04-01T00:00:00Z" }),
    ];
    expect(computeActivityStats(repos, NOW).mostRecentPush).toBe("2026-06-01T00:00:00Z");
  });
});

describe("computeDailyActivity", () => {
  const NOW = new Date("2026-06-12T12:00:00Z");

  it("returns exactly `days` entries", () => {
    const result = computeDailyActivity([], 91, NOW);
    expect(result).toHaveLength(91);
  });

  it("fills missing days with count 0", () => {
    const result = computeDailyActivity([], 7, NOW);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it("counts events on the correct day", () => {
    const events = [
      { created_at: "2026-06-10T14:00:00Z" },
      { created_at: "2026-06-10T22:00:00Z" },
      { created_at: "2026-06-11T09:00:00Z" },
    ];
    const result = computeDailyActivity(events, 7, NOW);
    const june10 = result.find((d) => d.date === "2026-06-10");
    const june11 = result.find((d) => d.date === "2026-06-11");
    expect(june10?.count).toBe(2);
    expect(june11?.count).toBe(1);
  });

  it("last entry is today", () => {
    const result = computeDailyActivity([], 91, NOW);
    expect(result[result.length - 1]?.date).toBe("2026-06-12");
  });
});