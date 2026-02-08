"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";

const DEFAULT_EMAIL = "demo@swoovie.dev";
const SWIPE_THRESHOLD = 80;

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  genres: string[];
  overview: string;
  posterUrl: string;
};

type SwipeState = {
  id: string;
  startX: number;
  startY: number;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const swipeRef = useRef<SwipeState | null>(null);

  const fetchMovies = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/movies${params}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as Movie[];
      setMovies(
        data.map((movie) => ({
          ...movie,
          genres: movie.genres as string[]
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(query);
  }, [fetchMovies, query]);

  const sendPreference = useCallback(
    async (movie: Movie, action: "like" | "dislike") => {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: DEFAULT_EMAIL,
          movieId: movie.id,
          action
        })
      });

      if (!response.ok) {
        setStatus("Could not save your feedback.");
        return;
      }

      setStatus(
        action === "like"
          ? `Saved ${movie.title} to Preferred.`
          : `Marked ${movie.title} as Disliked.`
      );
    },
    []
  );

  const handlePointerDown = useCallback(
    (movie: Movie, event: PointerEvent) => {
      swipeRef.current = {
        id: movie.id,
        startX: event.clientX,
        startY: event.clientY
      };
    },
    []
  );

  const handlePointerUp = useCallback(
    async (movie: Movie, event: PointerEvent) => {
      if (!swipeRef.current || swipeRef.current.id !== movie.id) return;

      const deltaX = event.clientX - swipeRef.current.startX;
      const deltaY = event.clientY - swipeRef.current.startY;
      swipeRef.current = null;

      if (
        Math.abs(deltaX) < SWIPE_THRESHOLD ||
        Math.abs(deltaX) < Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX > 0) {
        await sendPreference(movie, "like");
      } else {
        await sendPreference(movie, "dislike");
      }
    },
    [sendPreference]
  );

  const carouselContent = useMemo(() => {
    if (isLoading) {
      return <p>Loading movies...</p>;
    }

    if (movies.length === 0) {
      return <p>No movies match your search.</p>;
    }

    return (
      <ul className="carousel-list" aria-live="polite">
        {movies.map((movie) => (
          <li key={movie.id}>
            <article
              className="movie-card"
              aria-label={`Movie card for ${movie.title}`}
              onPointerDown={(event) => handlePointerDown(movie, event)}
              onPointerUp={(event) => handlePointerUp(movie, event)}
              onPointerCancel={() => {
                swipeRef.current = null;
              }}
            >
              <img src={movie.posterUrl} alt={`${movie.title} poster`} />
              <div>
                <h2>
                  {movie.title} ({movie.releaseYear})
                </h2>
                <p className="genres">{movie.genres.join(" · ")}</p>
                <p>{movie.overview}</p>
                <div className="controls">
                  <button
                    type="button"
                    onClick={() => sendPreference(movie, "dislike")}
                  >
                    Dislike
                  </button>
                  <button type="button" onClick={() => sendPreference(movie, "like")}>
                    Like
                  </button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    );
  }, [handlePointerDown, handlePointerUp, isLoading, movies, sendPreference]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Swoovie</p>
          <h1>Find your next favorite movie.</h1>
          <p className="subcopy">
            Scroll through the vertical carousel. Swipe right to like, swipe left
            to dislike, and we will personalize your recommendations.
          </p>
        </div>
        <nav className="nav">
          <a href="/preferred">Preferred</a>
          <a href="/recommendations">Recommendations</a>
        </nav>
      </header>

      <section className="card">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Search by title or story"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search movies"
          />
        </label>

        <div className="carousel">{carouselContent}</div>

        <p className="hint">
          Tip: Swipe right to like and left to dislike. You can also use the
          buttons for keyboard and mouse input.
        </p>
        {status ? <p className="status">{status}</p> : null}
      </section>
    </main>
  );
}
