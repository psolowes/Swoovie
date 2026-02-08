import { NextResponse } from "next/server";

import { parseGenres } from "../../../lib/genres";
import { prisma } from "../../../lib/prisma";
import { recommendMovies } from "../../../lib/recommend/recommender";

const DEFAULT_EMAIL = "demo@swoovie.dev";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("userEmail") ?? DEFAULT_EMAIL;
  const limitParam = Number(searchParams.get("n") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.max(1, limitParam) : 20;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      preferred: {
        include: { movie: true }
      },
      disliked: {
        include: { movie: true }
      }
    }
  });

  const preferredMovies = (user?.preferred ?? []).map((entry) => ({
    ...entry.movie,
    genres: parseGenres(entry.movie.genres)
  }));

  const dislikedIds = new Set(
    (user?.disliked ?? []).map((entry) => entry.movieId)
  );

  const candidates = await prisma.movie.findMany({
    orderBy: { title: "asc" }
  });

  const recommendations = recommendMovies({
    preferred: preferredMovies,
    candidates: candidates
      .filter((movie) => !dislikedIds.has(movie.id))
      .map((movie) => ({
        ...movie,
        genres: parseGenres(movie.genres)
      })),
    limit
  });

  return NextResponse.json({
    userEmail,
    recommendations
  });
}
