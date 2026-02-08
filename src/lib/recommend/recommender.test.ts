import { describe, expect, it } from "vitest";

import { recommendMovies, type MovieRecord } from "./recommender";

const candidates: MovieRecord[] = [
  {
    id: "1",
    title: "Action One",
    releaseYear: 2020,
    genres: ["Action"],
    overview: "An action hero saves the day with daring moves.",
    posterUrl: "action"
  },
  {
    id: "2",
    title: "Cozy Fantasy",
    releaseYear: 2021,
    genres: ["Fantasy"],
    overview: "A young hero discovers a magical kingdom.",
    posterUrl: "fantasy"
  },
  {
    id: "3",
    title: "Sci-Fi Thriller",
    releaseYear: 2019,
    genres: ["Science Fiction", "Thriller"],
    overview: "A scientist races against time in space.",
    posterUrl: "scifi"
  }
];

describe("recommendMovies", () => {
  it("excludes preferred movies", () => {
    const preferred = [candidates[0]];
    const recommendations = recommendMovies({
      preferred,
      candidates,
      limit: 3
    });

    expect(recommendations.find((movie) => movie.id === "1")).toBeUndefined();
  });

  it("returns why labels when there is overlap", () => {
    const overlapCandidates: MovieRecord[] = [
      {
        id: "a",
        title: "Space Rescue",
        releaseYear: 2022,
        genres: ["Science Fiction"],
        overview: "A daring rescue mission unfolds in deep space.",
        posterUrl: "space"
      },
      {
        id: "b",
        title: "Sci-Fi Thriller",
        releaseYear: 2019,
        genres: ["Science Fiction", "Thriller"],
        overview: "A scientist races against time in space.",
        posterUrl: "scifi"
      }
    ];

    const preferred = [overlapCandidates[1]];
    const recommendations = recommendMovies({
      preferred,
      candidates: overlapCandidates,
      limit: 1
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].why.length).toBeGreaterThan(0);
  });
});
