"use client";

import { useEffect, useState } from "react";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
};

type StatusState = {
  message: string;
  variant: "success" | "error" | "idle";
};

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [email, setEmail] = useState("viewer@swoovie.dev");
  const [statuses, setStatuses] = useState<Record<string, StatusState>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const loadMovies = async () => {
      const response = await fetch("/api/movies");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as Movie[];
      if (isMounted) {
        setMovies(data);
      }
    };

    void loadMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrefer = async (movieId: string) => {
    const userEmail = email.trim() || "viewer@swoovie.dev";
    setLoading((prev) => ({ ...prev, [movieId]: true }));
    setStatuses((prev) => ({
      ...prev,
      [movieId]: { message: "", variant: "idle" },
    }));

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, movieId }),
      });
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        setStatuses((prev) => ({
          ...prev,
          [movieId]: {
            message: error.error ?? "Unable to save preference.",
            variant: "error",
          },
        }));
        return;
      }

      setStatuses((prev) => ({
        ...prev,
        [movieId]: { message: "Preference saved!", variant: "success" },
      }));
    } catch (error) {
      setStatuses((prev) => ({
        ...prev,
        [movieId]: {
          message: "Network error. Please try again.",
          variant: "error",
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  return (
    <main className="page">
      <section className="card">
        <header className="card-header">
          <h1>Swoovie</h1>
          <p>Pick a movie and mark it as a favorite.</p>
        </header>

        <div className="email-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <ul className="movie-list">
          {movies.map((movie) => {
            const status = statuses[movie.id];
            return (
              <li key={movie.id} className="movie-item">
                <div>
                  <h2>{movie.title}</h2>
                  <p>{movie.releaseYear}</p>
                </div>
                <div className="movie-actions">
                  <button
                    type="button"
                    onClick={() => handlePrefer(movie.id)}
                    disabled={loading[movie.id]}
                  >
                    {loading[movie.id] ? "Saving..." : "Prefer"}
                  </button>
                  {status?.message ? (
                    <span className={`status ${status.variant}`}>
                      {status.message}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
