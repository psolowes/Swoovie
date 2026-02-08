export const GENRE_SEPARATOR = "|";

export const parseGenres = (value: string) =>
  value
    .split(GENRE_SEPARATOR)
    .map((genre) => genre.trim())
    .filter(Boolean);

export const serializeGenres = (genres: string[]) =>
  genres.map((genre) => genre.trim()).filter(Boolean).join(GENRE_SEPARATOR);
