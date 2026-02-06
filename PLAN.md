Ticket 0 — Bootstrap repo

Create Next.js TS app, add lint/test, add Prisma + SQLite

npm run dev, npm test, npm run lint all work

Ticket 1 — DB schema + seed

Prisma schema for Movie/User/Preferred

Seed script adds stub movies (or caches TMDB search results)

Ticket 2 — Search + carousel UI

Search input → results shown as swipeable carousel

Support keyboard: Left/Right to move, Enter = like

Use a high-quality swipe lib (or implement minimal pointer gestures)

Ticket 3 — Preferred API + persistence

POST /api/preferred add movie

GET /api/preferred list movies

DELETE /api/preferred/:id remove

Ticket 4 — Recommendations API

GET /api/recommendations?n=20

Uses recommender module; excludes Preferred

Ticket 5 — Recommendations UI

Grid/list with “why recommended” explanation (top 2 genres/keywords)

Ticket 6 — Tests

Unit tests for scoring function

Integration tests for API routes (add preferred → recs exclude it)

Ticket 7 — Polish

Empty states, loading states, error handling

A11y pass: focus order, ARIA labels, reduced motion option
