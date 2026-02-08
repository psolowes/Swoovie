import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userEmail?: string;
    movieId?: string;
  };

  if (!body.userEmail || !body.movieId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_FIELDS",
          message: "userEmail and movieId are required.",
          fields: ["userEmail", "movieId"],
        },
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
          fields: ["userEmail"],
        },
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
          fields: ["movieId"],
        },
      },
      { status: 400 }
    );
  }

  const movie = await prisma.movie.findUnique({
    where: { id: body.movieId },
    select: { id: true },
  });

  if (!movie) {
    return NextResponse.json(
      {
        error: {
          code: "MOVIE_NOT_FOUND",
          message: "Movie does not exist.",
          fields: ["movieId"],
        },
      },
      { status: 404 }
    );
  }

  const user = await prisma.user.upsert({
    where: { email: body.userEmail },
    update: {},
    create: { email: body.userEmail },
  });

  const preferred = await prisma.preferred.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: body.movieId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      movieId: body.movieId,
    },
  });

  return NextResponse.json({ preferred });
}
