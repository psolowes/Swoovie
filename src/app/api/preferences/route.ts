import { NextResponse } from "next/server";

import { parseGenres } from "../../../lib/genres";
import { prisma } from "../../../lib/prisma";

const DEFAULT_EMAIL = "demo@swoovie.dev";

const parseEmail = (request: Request) => {
  const { searchParams } = new URL(request.url);
  return searchParams.get("userEmail") ?? DEFAULT_EMAIL;
};

export async function GET(request: Request) {
  const userEmail = parseEmail(request);

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      preferred: {
        include: { movie: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const preferred = (user?.preferred ?? []).map((entry) => ({
    ...entry,
    movie: {
      ...entry.movie,
      genres: parseGenres(entry.movie.genres)
    }
  }));

  return NextResponse.json({
    userEmail,
    preferred
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userEmail?: string;
    movieId?: string;
    action?: "like" | "dislike";
  };

  if (!body.userEmail || !body.movieId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_FIELDS",
          message: "userEmail and movieId are required.",
          fields: ["userEmail", "movieId"]
        }
      },
      { status: 400 }
    );
  }

  if (
    typeof body.userEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.userEmail)
  ) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_EMAIL",
          message: "userEmail must be a valid email address.",
          fields: ["userEmail"]
        }
      },
      { status: 400 }
    );
  }

  if (typeof body.movieId !== "string") {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_MOVIE_ID",
          message: "movieId must be a string.",
          fields: ["movieId"]
        }
      },
      { status: 400 }
    );
  }

  const movie = await prisma.movie.findUnique({
    where: { id: body.movieId },
    select: { id: true }
  });

  if (!movie) {
    return NextResponse.json(
      {
        error: {
          code: "MOVIE_NOT_FOUND",
          message: "Movie does not exist.",
          fields: ["movieId"]
        }
      },
      { status: 404 }
    );
  }

  const user = await prisma.user.upsert({
    where: { email: body.userEmail },
    update: {},
    create: { email: body.userEmail }
  });

  const preferred = await prisma.preferred.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: body.movieId
      }
    },
    update: {},
    create: {
      userId: user.id,
      movieId: body.movieId
    },
    include: { movie: true }
  });

  return NextResponse.json({
    preferred: {
      ...preferred,
      movie: {
        ...preferred.movie,
        genres: parseGenres(preferred.movie.genres)
      }
    }
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("userEmail") ?? DEFAULT_EMAIL;
  const movieId = searchParams.get("movieId");

  if (!movieId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_MOVIE_ID",
          message: "movieId is required.",
          fields: ["movieId"]
        }
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return NextResponse.json({ removed: false });
  }

  await prisma.preferred.deleteMany({
    where: { userId: user.id, movieId }
  });

  return NextResponse.json({ removed: true });
}
