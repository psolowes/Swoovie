import { NextResponse } from "next/server";

import { parseGenres } from "../../../lib/genres";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  const movies = await prisma.movie.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { overview: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: {
      title: "asc"
    }
  });

  return NextResponse.json(
    movies.map((movie) => ({
      ...movie,
      genres: parseGenres(movie.genres)
    }))
  );
}
