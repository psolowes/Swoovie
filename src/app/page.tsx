import { readFile } from "node:fs/promises";
import path from "node:path";

type Movie = {
  title: string;
  releaseYear: number;
};

export default async function HomePage() {
  const dataPath = path.join(process.cwd(), "data", "stub-movies.json");
  const raw = await readFile(dataPath, "utf-8");
  const movies = JSON.parse(raw) as Movie[];

  return (
    <main className="page">
      <section className="card">
        <h1>Swoovie</h1>
        <p>Next.js 14 starter with Prisma, Vitest, and formatting tools.</p>
        <ul>
          {movies.length === 0 ? (
            <li>No movies available.</li>
          ) : (
            movies.map((movie) => (
              <li key={`${movie.title}-${movie.releaseYear}`}>
                {movie.title} ({movie.releaseYear})
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
