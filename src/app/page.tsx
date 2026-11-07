"use client"

import { useState, useSyncExternalStore, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const STORAGE_KEY = "repolens_recent";

function readRecent() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return JSON.stringify(Array.isArray(value) ? value.filter(v => typeof v === "string").slice(0, 5) : []);
  } catch { return "[]"; }
}
function subscribeRecent(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener("repolens-recent", update);
  return () => { window.removeEventListener("storage", update); window.removeEventListener("repolens-recent", update); };
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const recentJson = useSyncExternalStore(subscribeRecent, readRecent, () => "[]");
  const recent: string[] = JSON.parse(recentJson);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function saveRecent(username: string) {
    const updated = [username, ...recent.filter((u) => u !== username)].slice(0, 5);

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); }
    catch { /* Browsing still works when storage is disabled. */ }
    window.dispatchEvent(new Event("repolens-recent"));
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