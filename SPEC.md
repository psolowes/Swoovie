Goal

Users browse a movie carousel, swipe right to add a movie to Preferred, then see AI recommendations based on their Preferred list.

Non-goals (v0)

No payments, no social features, no multi-device sync

No “perfect” recommendation science; just a solid first-pass

No full streaming-availability matching (can add later)

MVP Features (v0)

Movie discovery carousel (search → results in swipeable carousel)

Swipe right = add to Preferred (persisted)

Preferred list page (view/remove)

Recommendations page (server-generated) based on Preferred

Basic accessibility: keyboard controls + ARIA labels + focus states

User stories

As a user, I can search for movies and swipe right to save them.

As a user, I can see my Preferred list and remove items.

As a user, I can see recommended movies similar to my Preferred list.

Acceptance tests (definition of done)

npm test passes (unit tests for recommender + API)

Swiping right triggers a single API call and persists the movie

Reloading the app keeps Preferred list intact

Recommendations return N movies not already Preferred

Keyboard-only operation works for the carousel (left/right/like)

Data sources

Use a public movie catalog API (TMDB is the usual default) behind a server route so keys aren’t exposed.

If no API key exists yet: implement a stub catalog with a small JSON dataset so the app runs end-to-end.

Architecture (the “don’t overthink it” version)
Recommended v0 stack (fast + high quality)

Next.js (TypeScript): UI + API routes in one repo

Prisma + SQLite: local persistence, zero ops

Recommender v0: content-based similarity (genres + overview text)

Start with cheap heuristics; optionally upgrade to embeddings later.

Why this is good: you get an end-to-end product quickly, and you can swap SQLite → Postgres/pgvector later without rewriting the UI.

File layout (target)

/app (Next.js UI pages)

/app/api/* (API routes)

/lib/recommend/* (recommender logic + tests)

/prisma/schema.prisma (DB schema)

/data/stub-movies.json (only for “no API key yet” mode)

Data model (Prisma)

Movie: id, sourceId (e.g., TMDB id), title, year, genres, overview, posterUrl

User: id (for v0 you can hardcode a single local user)

Preferred: userId, movieId, createdAt

Note: v0 can be single-user without auth. Keep the table anyway so multi-user is later.

Recommendations (v0 that works)
Algorithm v0 (deterministic + testable)

Build a “user taste vector” from Preferred:

genre weights (e.g., +1 per genre per liked movie)

TF-IDF-ish keywords from overview (optional)

Candidate pool = recent search results + trending list + popular list (or stub set)

Score candidates by:

genre overlap score

keyword overlap score

penalty if already Preferred

Return top N.

This is not “AI magic,” but it’s predictably good enough to validate the product loop.

Algorithm v1 upgrade (real AI)

Add embeddings for movie descriptions/genres

Compute cosine similarity between Preferred centroid and candidates

Store embeddings in DB (later: Postgres + pgvector)
