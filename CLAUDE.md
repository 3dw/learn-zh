# learn-zh

自主學中文 — A Chinese learning web app built with Vue 3 + Cloudflare Workers.

## Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), TypeScript, Vue Router 5
- **Build**: Vite 7 with `@cloudflare/vite-plugin`
- **Backend**: Cloudflare Workers (`server/index.ts`)
- **Deploy**: Wrangler 4 → Cloudflare Pages + Workers (SPA mode)

## Project Structure

```
src/
  views/          # Page components (HomeView, AboutView, CustomPage, ThreeCharacterPage, WhatIsThisPage)
  components/     # Shared UI components
  router/         # Vue Router config (index.ts)
  utils/          # Utility modules
  main.ts         # App entry point
server/
  index.ts        # Cloudflare Worker (API routes under /api/)
```

## Routes

| Path              | View                  | Description         |
|-------------------|-----------------------|---------------------|
| `/`               | HomeView              | Home                |
| `/about`          | AboutView             | About               |
| `/custom`         | CustomPage            | 自訂朗讀             |
| `/three-character`| ThreeCharacterPage    | 三字經               |
| `/what-is-this`   | WhatIsThisPage        | AI 圖片學            |

## Common Commands

```sh
npm run dev        # Vite dev server (frontend only)
npm run build      # Type-check + build for production
npm run preview    # Build then run with wrangler dev (includes Worker)
npm run deploy     # Build + deploy to Cloudflare
npm run cf-typegen # Regenerate Cloudflare env types
```

## Key Notes

- API routes live in `server/index.ts` and are served under `/api/`
- The app is deployed as a single-page application on Cloudflare Pages with a Worker backend
- `wrangler.jsonc` controls the Worker config; `vite.config.ts` controls the frontend build
- Use `vue-tsc` for type checking (not plain `tsc`), as `.vue` file types require it
