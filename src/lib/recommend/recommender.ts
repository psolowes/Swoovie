export type MovieRecord = {
  id: string;
  title: string;
  releaseYear: number;
  genres: string[];
  overview: string;
  posterUrl: string;
};

export type Recommendation = MovieRecord & {
  score: number;
  why: string[];
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "is",
  "its",
  "into",
  "his",
  "her",
  "their",
  "from",
  "through",
  "against",
  "at",
  "as",
  "by",
  "be",
  "are",
  "was",
  "were",
  "it"
]);

const tokenize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
};

const buildTasteVector = (preferred: MovieRecord[]) => {
  const genreWeights = new Map<string, number>();
  const keywordWeights = new Map<string, number>();

  for (const movie of preferred) {
    for (const genre of movie.genres) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + 1);
    }

    for (const token of tokenize(movie.overview)) {
      keywordWeights.set(token, (keywordWeights.get(token) ?? 0) + 1);
    }
  }

  return { genreWeights, keywordWeights };
};

const scoreCandidate = (
  movie: MovieRecord,
  genreWeights: Map<string, number>,
  keywordWeights: Map<string, number>
) => {
  let score = 0;
  const reasons: { label: string; score: number }[] = [];

  for (const genre of movie.genres) {
    const weight = genreWeights.get(genre) ?? 0;
    if (weight > 0) {
      score += weight * 2;
      reasons.push({ label: genre, score: weight * 2 });
    }
  }

  for (const token of tokenize(movie.overview)) {
    const weight = keywordWeights.get(token) ?? 0;
    if (weight > 0) {
      score += weight;
      reasons.push({ label: token, score: weight });
    }
  }

  reasons.sort((a, b) => b.score - a.score);

  return {
    score,
    why: reasons.slice(0, 2).map((reason) => reason.label)
  };
};

export const recommendMovies = ({
  preferred,
  candidates,
  limit = 20
}: {
  preferred: MovieRecord[];
  candidates: MovieRecord[];
  limit?: number;
}): Recommendation[] => {
  if (candidates.length === 0) {
    return [];
  }

  const { genreWeights, keywordWeights } = buildTasteVector(preferred);
  const preferredIds = new Set(preferred.map((movie) => movie.id));

  const scored = candidates
    .filter((movie) => !preferredIds.has(movie.id))
    .map((movie) => {
      const { score, why } = scoreCandidate(movie, genreWeights, keywordWeights);
      return { ...movie, score, why };
    })
    .filter((movie) => movie.score > 0 || preferred.length === 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return scored.slice(0, limit);
};
