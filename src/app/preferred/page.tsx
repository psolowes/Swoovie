"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_EMAIL = "demo@swoovie.dev";

type PreferredEntry = {
  id: string;
  movie: {
    id: string;
    title: string;
    releaseYear: number;
    posterUrl: string;
    genres: string[];
  };
};

export default function PreferredPage() {
  const [preferred, setPreferred] = useState<PreferredEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferred = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch(
      `/api/preferences?userEmail=${encodeURIComponent(DEFAULT_EMAIL)}`,
      { cache: "no-store" }
    );
    const data = (await response.json()) as { preferred: PreferredEntry[] };
    setPreferred(
      (data.preferred ?? []).map((entry) => ({
        ...entry,
        movie: {
          ...entry.movie,
          genres: entry.movie.genres as string[]
        }
      }))
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPreferred();
  }, [loadPreferred]);

  const handleRemove = async (movieId: string) => {
    await fetch(
      `/api/preferences?userEmail=${encodeURIComponent(
        DEFAULT_EMAIL
      )}&movieId=${encodeURIComponent(movieId)}`,
      { method: "DELETE" }
    );
    await loadPreferred();
  };

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Preferred</p>
          <h1>Your saved movies</h1>
          <p className="subcopy">
            Remove movies from your Preferred list any time.
          </p>
        </div>
        <nav className="nav">
          <a href="/">Discover</a>
          <a href="/recommendations">Recommendations</a>
        </nav>
      </header>

      <section className="card">
        {isLoading ? (
          <p>Loading your Preferred list...</p>
        ) : preferred.length === 0 ? (
          <p>You have not liked any movies yet.</p>
        ) : (
          <ul className="grid">
            {preferred.map((entry) => (
              <li key={entry.id} className="grid-card">
                <img
                  src={entry.movie.posterUrl}
                  alt={`${entry.movie.title} poster`}
                />
                <div>
                  <h2>
                    {entry.movie.title} ({entry.movie.releaseYear})
                  </h2>
                  <p className="genres">{entry.movie.genres.join(" · ")}</p>
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.movie.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
