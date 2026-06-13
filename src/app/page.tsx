"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Metadata } from "next";

const STORAGE_KEY = "repolens_recent";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored) as string[]);
    } catch {
      
    }
  }, []);

  function saveRecent(username: string) {
    const updated = [username, ...recent.filter((u) => u !== username)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const username = query.trim();
    if (!username) return;
    saveRecent(username);
    startTransition(() => {
      router.push(`/u/${encodeURIComponent(username)}`);
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">RepoLens</h1>
      <p className="mb-8 text-gray-500">Explore any GitHub developer profile</p>

      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="GitHub username"
            disabled={isPending}
            className="flex-1 rounded border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isPending || query.trim() === ""}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Search"}
          </button>
        </div>

        {recent.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-gray-400">Recent</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setQuery(u);
                    startTransition(() => router.push(`/u/${encodeURIComponent(u)}`));
                  }}
                  className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:border-black hover:text-black"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}