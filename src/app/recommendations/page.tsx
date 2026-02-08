"use client";

import { useEffect, useState } from "react";

const DEFAULT_EMAIL = "demo@swoovie.dev";

type Recommendation = {
  id: string;
  title: string;
  releaseYear: number;
  posterUrl: string;
  genres: string[];
  overview: string;
  why: string[];
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const response = await fetch(
        `/api/recommendations?userEmail=${encodeURIComponent(
          DEFAULT_EMAIL
        )}&n=12`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as {
        recommendations: Recommendation[];
      };
      setRecommendations(
        (data.recommendations ?? []).map((movie) => ({
          ...movie,
          genres: movie.genres as string[]
        }))
      );
      setIsLoading(false);
    };

    load();
  }, []);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h1>Because you liked…</h1>
          <p className="subcopy">
            These picks match the genres and themes in your Preferred list.
          </p>
        </div>
        <nav className="nav">
          <a href="/">Discover</a>
          <a href="/preferred">Preferred</a>
        </nav>
      </header>

      <section className="card">
        {isLoading ? (
          <p>Finding recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p>
            Like a few movies first so we can tailor your recommendations.
          </p>
        ) : (
          <ul className="grid">
            {recommendations.map((movie) => (
              <li key={movie.id} className="grid-card">
                <img src={movie.posterUrl} alt={`${movie.title} poster`} />
                <div>
                  <h2>
                    {movie.title} ({movie.releaseYear})
                  </h2>
                  <p className="genres">{movie.genres.join(" · ")}</p>
                  <p>{movie.overview}</p>
                  {movie.why.length > 0 ? (
                    <p className="why">
                      Why: {movie.why.slice(0, 2).join(", ")}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
