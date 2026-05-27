# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Internal image generation API service with management UI. Wraps AI image providers (Z.AI/Zhipu, Xiaomi) behind HTTP endpoints, backed by SQLite. All UI text is in Chinese (zh-CN).

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

**Framework:** Next.js 16 (App Router), Ant Design 6, Tailwind CSS 4

**Database:** SQLite via `better-sqlite3`. Singleton instance in `src/lib/db.ts` with WAL mode and foreign keys enabled. Stored at `DATABASE_URL` (format: `file:/path`) or defaults to `data/baoyuimages.db`. Three tables: `api_keys`, `generation_records`, `settings`.

**Provider pattern:** Each image provider implements `ImageProvider` interface in `src/providers/types.ts`, returning `Promise<Buffer>` (PNG bytes). The factory in `src/providers/index.ts` exposes `createProvider(name, config?)` and a convenience `generateImage()` wrapper. Current implementations:

- `zai.ts` — Z.AI/智谱. Two model families with different size constraints: `glm-image` (step=32, 1024-2048px, max 2^22 pixels) vs legacy models (step=16, 512-2048px, max 2^21 pixels). Maps quality "normal"→"standard", "2k"→"hd".
- `xiaomi.ts` — Xiaomi. OpenAI-compatible `/images/generations` endpoint. Supports `gpt-image` (medium/high quality) and `dall-e-3` (standard/hd quality) model families.

**API routes** in `src/app/api/`:

- `POST /api/generate` — Generate image. Key resolution chain: request body > settings table (`{provider}_api_key`) > api_keys table. Model resolution: request > settings (`{provider}_model`) > provider default. Base URL from settings (`{provider}_base_url`).
- `GET/POST /api/keys` — List/add API keys
- `DELETE/PATCH /api/keys/[id]` — Delete/toggle key
- `GET /api/records` — Query generation records (pagination, provider/status filters)
- `GET/POST /api/settings` — Read/write app settings (key-value store)
- `GET /api/stats` — Dashboard statistics (totals, success/fail, today count, avg duration, per-provider counts)

**Frontend pages** in `src/app/`: dashboard (`/`), generate (`/generate`), keys (`/keys`), records (`/records`), settings (`/settings`). All client-rendered with `"use client"`. Uses Ant Design components with inline `style` props (not CSS modules). Tailwind available but primary styling is through Ant Design's `ConfigProvider` theme and inline styles.

**Layout:** `src/app/layout.tsx` defines a sidebar layout using Ant Design's `Layout.Sider` with dark indigo theme (`#1e1b4b`). Menu items link to each page. The layout is a client component wrapping children in `AntdRegistry` and `ConfigProvider`.

## Key Technical Details

- Path alias: `@/*` maps to `./src/*`
- API keys and provider base URLs are managed through the UI settings, not environment variables
- The `settings` table is a simple key-value store used for both provider config and app defaults (e.g., `default_provider`, `default_ar`, `default_quality`, `zai_model`, `xiaomi_model`)
- `ProviderError` class in `src/providers/types.ts` carries provider name and HTTP status code
- All providers validate API key presence before making requests

## CI/CD

GitHub Actions (`.github/workflows/docker.yml`): builds Docker image, pushes to GHCR on main/tag, auto-deploys to production server via SSH on main push. Production runs on port 6668 with container name `BaoyuImages`.

## Adding a New Provider

1. Create `src/providers/newprovider.ts` implementing `ImageProvider` interface
2. Add provider name to the `Provider` type union in `src/providers/types.ts`
3. Register in `src/providers/index.ts` factory (`createProvider` switch and `providers` map)
4. Add to `PROVIDERS` array in `src/app/generate/page.tsx`
5. Add default model entry in `src/app/api/generate/route.ts` (`DEFAULT_MODELS`)
