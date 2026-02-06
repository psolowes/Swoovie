import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userEmail?: string;
    movieId?: string;
  };

  if (!body.userEmail || !body.movieId) {
    return NextResponse.json(
      { error: "userEmail and movieId are required." },
      { status: 400 }
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
