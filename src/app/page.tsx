"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
      // Ignore local storage errors silently
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white selection:bg-white selection:text-black font-sans">
      
      <div className="mb-10 flex flex-col items-center">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-white bg-black mb-6">
          <Image 
            src="/cowboy-cat.jpg" 
            alt="RepoLens Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-mono uppercase tracking-tighter">
          RepoLens
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-mono uppercase tracking-widest text-white/50">
          Explore any GitHub profile
        </p>
      </div>

      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ENTER USERNAME..."
            disabled={isPending}
            className="flex-1 rounded-none border border-white bg-transparent p-4 font-mono text-lg text-white placeholder:text-white/30 focus:bg-white focus:text-black focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || query.trim() === ""}
            className="mt-2 sm:mt-0 sm:-ml-px rounded-none border border-white bg-black p-4 font-mono text-lg uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
          >
            {isPending ? " ... " : " SEARCH "}
          </button>
        </form>

        {recent.length > 0 && (
          <div className="mt-12 border-t border-white/30 pt-6">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-white/50">
              Recent Logs
            </p>
            <div className="flex flex-wrap gap-3">
              {recent.map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setQuery(u);
                    startTransition(() => router.push(`/u/${encodeURIComponent(u)}`));
                  }}
                  className="rounded-none border border-white/30 bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-wider text-white/70 hover:border-white hover:bg-white hover:text-black transition-colors"
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