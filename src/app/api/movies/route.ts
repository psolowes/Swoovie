import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export async function GET() {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return NextResponse.json(movies);
}
