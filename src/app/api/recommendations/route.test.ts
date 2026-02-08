import { describe, expect, it, vi } from "vitest";

import { GET } from "./route";

vi.mock("../../../lib/prisma", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn()
      },
      movie: {
        findMany: vi.fn()
      }
    }
  };
});

const mockedPrisma = await import("../../../lib/prisma");

const movies = [
  {
    id: "1",
    title: "Action One",
    releaseYear: 2020,
    genres: "Action",
    overview: "An action hero saves the day with daring moves.",
    posterUrl: "action"
  },
  {
    id: "2",
    title: "Sci-Fi Thriller",
    releaseYear: 2019,
    genres: "Science Fiction|Thriller",
    overview: "A scientist races against time in space.",
    posterUrl: "scifi"
  }
];

describe("GET /api/recommendations", () => {
  it("excludes preferred movies", async () => {
    mockedPrisma.prisma.user.findUnique.mockResolvedValue({
      preferred: [{ movie: movies[0] }]
    });
    mockedPrisma.prisma.movie.findMany.mockResolvedValue(movies);

    const response = await GET(
      new Request("http://localhost/api/recommendations?n=2")
    );
    const body = (await response.json()) as {
      recommendations: { id: string }[];
    };

    expect(body.recommendations.find((movie) => movie.id === "1")).toBe(
      undefined
    );
  });
});
