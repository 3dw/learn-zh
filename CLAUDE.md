# learn-zh

自主學華文 — A Madarin learning web app built with Vue 3 + Cloudflare Workers.

## Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), TypeScript, Vue Router 5
- **Build**: Vite 7 with `@cloudflare/vite-plugin`
- **Backend**: Cloudflare Workers (`server/index.ts`)
- **Deploy**: Wrangler 4 → Cloudflare Pages + Workers (SPA mode)
- **Key libs**: `heic2any` (HEIC conversion), `pica` (image resizing)

## Project Structure

```
src/
  views/          # Page components (see Routes table below)
  components/
    HelloWorld.vue        # Header subtitle component
    TheWelcome.vue        # Unused boilerplate
    WelcomeItem.vue       # Unused boilerplate
    icons/                # Unused SVG icon components
  router/
    index.ts              # Vue Router config
  utils/
    speechVoice.ts        # Web Speech API helpers (voice selection, TTS)
  App.vue                 # Root layout with nav links
  main.ts                 # App entry point
server/
  index.ts        # Cloudflare Worker (minimal placeholder, returns { name: "Cloudflare" })
```

## Routes

| Path               | View                 | Description                        |
|--------------------|----------------------|------------------------------------|
| `/`                | HomeView             | 首頁 — feature card links           |
| `/about`           | AboutView            | 關於 — project mission & stack      |
| `/custom`          | CustomPage           | 自訂朗讀 — custom TTS with CSV homophones |
| `/three-character` | ThreeCharacterPage   | 三字經 — classic text TTS reader    |
| `/what-is-this`    | WhatIsThisPage       | AI 圖片學 — image recognition learner |

## Common Commands

```sh
npm run dev        # Vite dev server (frontend only)
npm run build      # Type-check + build for production
npm run preview    # Build then run with wrangler dev (includes Worker)
npm run deploy     # Build + deploy to Cloudflare
npm run cf-typegen # Regenerate Cloudflare env types
```

## Key Notes

- **Speech synthesis**: Uses Web Speech API via `src/utils/speechVoice.ts`; prefers Taiwan accent (`zh-TW`) with keyword fallback
- **Custom TTS** (`/custom`): Accepts raw text + CSV homophone replacements; previews processed text before speaking
- **Three Character Classic** (`/three-character`): Built-in hardcoded homophones (e.g. 教→叫, 為人子→危人子)
- **AI image learning** (`/what-is-this`): Camera/file upload → HEIC conversion + compression (max 1.5MB) → external API at `zh-en-backend.alearn13994229.workers.dev/detect-image-zh` → Chinese/English labels with TTS; favorites saved to localStorage
- **Worker backend** is a stub; real image recognition is via the external `zh-en-backend` Worker
- API routes live in `server/index.ts` and are served under `/api/`
- `wrangler.jsonc` controls the Worker config; `vite.config.ts` controls the frontend build
- Use `vue-tsc` for type checking (not plain `tsc`), as `.vue` file types require it
- All routes are lazy-loaded except HomeView
