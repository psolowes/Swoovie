import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MovieSeed = {
  title: string;
  releaseYear: number;
};

async function main() {
  const dataPath = path.join(process.cwd(), "data", "stub-movies.json");
  const raw = await readFile(dataPath, "utf-8");
  const movies = JSON.parse(raw) as MovieSeed[];

  for (const movie of movies) {
    await prisma.movie.upsert({
      where: { title: movie.title },
      create: movie,
      update: { releaseYear: movie.releaseYear }
    });
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@swoovie.dev" },
    create: { email: "demo@swoovie.dev", name: "Demo User" },
    update: { name: "Demo User" }
  });

  const firstMovie = await prisma.movie.findFirst({ orderBy: { title: "asc" } });
  if (firstMovie) {
    await prisma.preferred.upsert({
      where: { userId_movieId: { userId: user.id, movieId: firstMovie.id } },
      create: { userId: user.id, movieId: firstMovie.id },
      update: {}
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
