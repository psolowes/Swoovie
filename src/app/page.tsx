"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_EMAIL = "demo@swoovie.dev";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  genres: string[];
  overview: string;
  posterUrl: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentMovie = useMemo(
    () => movies[currentIndex] ?? null,
    [movies, currentIndex]
  );

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
      setCurrentIndex(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(query);
  }, [fetchMovies, query]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, movies.length - 1));
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleLike = useCallback(async () => {
    if (!currentMovie) return;
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: DEFAULT_EMAIL,
        movieId: currentMovie.id
      })
    });

    if (!response.ok) {
      setStatus("Could not save to Preferred.");
      return;
    }

    setStatus(`Saved ${currentMovie.title} to Preferred.`);
  }, [currentMovie]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        handlePrev();
      }
      if (event.key === "Enter") {
        handleLike();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLike, handleNext, handlePrev]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Swoovie</p>
          <h1>Find your next favorite movie.</h1>
          <p className="subcopy">
            Search the catalog, swipe (or tap) through results, and like movies
            to build your Preferred list.
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

        <div className="carousel" aria-live="polite">
          {isLoading ? (
            <p>Loading movies...</p>
          ) : currentMovie ? (
            <article className="movie-card" aria-label="Movie carousel card">
              <img
                src={currentMovie.posterUrl}
                alt={`${currentMovie.title} poster`}
              />
              <div>
                <h2>
                  {currentMovie.title} ({currentMovie.releaseYear})
                </h2>
                <p className="genres">{currentMovie.genres.join(" · ")}</p>
                <p>{currentMovie.overview}</p>
              </div>
            </article>
          ) : (
            <p>No movies match your search.</p>
          )}
        </div>

        <div className="controls">
          <button type="button" onClick={handlePrev} disabled={currentIndex <= 0}>
            Previous
          </button>
          <button type="button" onClick={handleLike} disabled={!currentMovie}>
            Like
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= movies.length - 1}
          >
            Next
          </button>
        </div>

        <p className="hint">
          Tip: Use Left/Right arrows to navigate and Enter to like.
        </p>
        {status ? <p className="status">{status}</p> : null}
      </section>
    </main>
  );
}
